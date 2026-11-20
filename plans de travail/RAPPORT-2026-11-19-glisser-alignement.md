# Rapport — #1295, le glisser d'Alignement (19 nov. 2026)

**Dernier relais.** Branche `lot/glisser-alignement`, partie de `origin/main` `ade09e939` (relais de la 1.250.0).
APERÇU, à ne pas fusionner : ni fusion ni release avant la fenêtre du lundi 23 novembre. **Fait** : les sept points
de la consigne (`CONSIGNE-2026-11-19-glisser-alignement.md`). **Reste** : la relecture croisée, puis, à la fenêtre de
release, le verdict WebKit complet ; la ligne de Nouvelles est à valider (§6) ; la question du stock est à trancher (§4).

## 1. En bref

La « régression » de parcours-5 n'est pas une régression de l'application. Le défaut est dans le code depuis le
28 février 2026. Le 17 novembre, un changement du banc (la trace Playwright n'est plus écrite qu'à la reprise d'un
essai rouge) a accéléré les gestes du banc, ce qui l'a rendu visible. Le correctif tient en une fonction
(`throttleRAF`) et six appels, un par relâchement. Un banc neuf le verrouille, à la souris et au doigt, en paysage et en
portrait : rouge sans le correctif, vert avec.

## 2. Datation (bissection)

Le banc mesuré est parcours-5, « les sept étapes… (1180 px) », WebKit, seul, `--retries=0`, trois passages par
commit. Verdict : *vert* si 3 sur 3 ; *rouge* si au moins 2 rouges à la ligne 334 ; *sauté* sinon.

| Commit | Ce qu'il est | Résultat |
|---|---|---|
| `e5ad10f90` | `main`, relais avant la fusion | vert 3/3 |
| `a2ce7777c` | `main`, fusion de `lot/deux-temps-modeles` | rouge 0/3 (sauté : 1 rouge l. 334, 2 ailleurs) |
| `ecdf87940` | `main`, release **1.249.0** | rouge (2 rouges l. 334) |
| `5d9c93d36` | branche, parent du suivant | vert 3/3 |
| **`dc5bc4f30`** | branche : `trace: 'on-first-retry'` au lieu de `retain-on-failure` | **rouge 0/3 (2 l. 334)** |
| `8449f25cc` + `--trace retain-on-failure` | contrôle : la 1.249.0, ancienne trace | vert 3/3 |

**Ce qui a révélé le défaut** : `dc5bc4f30` (17 nov.), un commit de banc ; il est entré sur `main` par la fusion
`a2ce7777c` et en ligne avec la **1.249.0**. Aucun code de l'application n'a changé à cet endroit : écrire la trace
à chaque essai ralentissait assez Playwright pour qu'une seule image passe entre deux mouvements.
**Ce qui porte le défaut** : `a0bc2e9c4` (28 fév. 2026, « throttle rAF drag handlers »), en ligne depuis la
**Beta 98.3** (build 0228-2100).

Sur la branche fusionnée, les échecs « ailleurs » (`5a0944508`, `85ca6332f`, `84927a63a` : 2 verts sur 3) sont
des intermittents d'avant la plage, sans rapport avec la ligne 334. Ils ont fait sauter trop de commits pour que
`git bisect` conclue seul ; le couple `5d9c93d36` / `dc5bc4f30` a été joué directement.

## 3. Le correctif

`throttleRAF` (`js/planification-carte.js`) garde désormais le **dernier** événement reçu dans l'image, et non plus le
premier. Il expose aussi `vider(eFin)`, appelé en tête de chaque relâchement : l'image en attente est annulée, et la
position finale est appliquée, celle du `pointerup` lui-même, ou, sur un `pointercancel` (dont les coordonnées ne
sont pas fiables), le dernier mouvement reçu. Sans mouvement reçu (un simple clic), `vider` ne fait rien : un clic ne
déplace ni n'aimante un bloc. Les gestionnaires calculent leur position depuis le point de départ du geste : rejouer
la position finale ne produit aucun effet de bord.

Un second défaut est corrigé du même coup : l'image en attente s'exécutait **après** le relâchement. Elle déplaçait
le bloc et retraçait le survol d'une cible déjà jugée.

**Revue des usages** (9 appels de `throttleRAF`) :

| Usage | Fin par un lâcher ? | Décision |
|---|---|---|
| CAS D, bloc libre (`onUpD`) | oui, rattache à la leçon | `vider` : **le cas de parcours-5** |
| CAS B, feuille dans un conteneur (`onUpB`) | oui, déménage ou détache | `vider` |
| CAS C, conteneur (`onUpC`) | oui, rattache ou détache | `vider` |
| Groupe multi-sélection (`onUpGroupe`) | oui, enregistre la position | `vider` |
| Poignée de taille (`surRelachement`) | oui, mesure `offsetWidth` | `vider` |
| Lasso (`onUp`) | oui ; relit déjà sa position, mais `moved` pouvait rester faux | `vider` |
| Titre du bloc, lignes d'objectifs (`input`) | non (frappe) | inchangés ; le dernier événement ne change rien, la fonction lit le champ |
| Planificateur (`deposerDansGrille`) | oui | **non touché** : son `pointermove` n'est pas limité, et son `pointerup` lit `e.clientX/Y` |
| Dépôt depuis la palette | oui | **non touché** : glisser HTML5 (`drop`), position de l'événement |

Les gestes au doigt passent par les mêmes Pointer Events : la revue vaut pour la souris et le doigt.

## 4. Source ou stock

**Oui, un lâcher raté a pu écrire quelque chose de faux, et c'est enregistré** : chaque relâchement se termine par
`sauvegarder()`. Mesuré au banc neuf, sans le correctif, en WebKit : l'activité reste **libre** à côté de la leçon
visée (4 sur 6), ou reste dans sa **leçon de départ** au lieu de déménager (2 sur 6). Dans une première version du
banc, posée sur la carte de la démo, l'activité était rangée dans une **autre leçon** de la démo (`planif-noeud_10`),
celle qu'elle recouvrait au départ : le filet de recouvrement jugeait un bloc resté sur place.

**Le stock chez les gens n'est pas mesurable d'ici.** Les cartes vivent dans le navigateur de chacun ; aucun
signalement d'un dépôt raté n'existe au suivi des bugs (#1295 était « non vécu »). Le codex de Grégoire n'a pas été
ouvert : il porte des données d'élèves, et la carte s'y lit par son navigateur.

*Inférence, non mesurée* : à la main, Chrome et Safari alignent les `pointermove` sur l'image. L'écart d'une vraie main
est donc au plus d'une image, et non de onze mouvements comme au banc. Il suffit pourtant pour un relâchement près du
bord d'une leçon. L'erreur se voit au moment du geste : l'activité reste à côté, ou dans la mauvaise leçon. Rien n'a
été réparé.

Si Grégoire veut une mesure de son propre stock, un détecteur en lecture seule est possible : toute activité ou
évaluation libre dont la boîte recouvre à plus de 50 % une leçon, le critère même du filet de recouvrement. Non écrit,
en attente de sa décision.

## 5. Bancs

**Banc neuf** `tests/integration/planif-glisser-relachement-1295.spec.js` : trois essais (souris, libre vers leçon ;
doigt, tous les mouvements dans la même image ; souris, déménagement d'une leçon à l'autre) × deux fenêtres (paysage
1180 × 820, portrait 820 × 1180). Il vérifie d'abord ce qui est sous le point de saisie et sous le point de dépôt ;
cette garde a révélé trois pièges de mise en place, corrigés : la palette et le Planificateur couvrent une partie du
canevas, un bloc de la démo peut couvrir la leçon, et la carte se recentre en différé. Aucune pause fixe : la
sentinelle des pauses reste à son plafond.

| Passage | Avec le correctif | Sans (break-test, `planification-carte.js` d'`origin/main`) |
|---|---|---|
| WebKit | **6/6** (deux fois) | **0/6** (deux fois) |
| Chrome du Mac (`channel: 'chrome'`) | **6/6** | 4/6 : les deux essais au doigt rougissent |

À la souris, Chrome laisse passer une image entre deux mouvements de Playwright : seul le doigt y départage. Le
Chromium de Playwright n'est pas installé sur le Mac ; Chrome a été lancé par une config temporaire, non versionnée.

**parcours-5** (WebKit, `--retries=0`, fichier entier, trois fois) : « les sept étapes » **verte 3/3**. Elle sort des
échecs connus (`scripts/playwright-baseline.json`, note `_note20261119c`). « capture 25 », du même fichier, rougit par
intermittence à la ligne 421, avant tout glisser, avec ou sans le correctif (avec : 2 rouges sur 4 ; sans : 3 sur 4
puis 1 sur 2) : **inscrit, #1296**.

**Bancs du module** (17 fichiers `planif-*` et `palettes-drag-rendu`, WebKit) : 87 verts, 1 rouge, « Raccourcis
clavier » de `planif-menu-vue`. Rejoué seul : vert avec le correctif (1/1) et sans (2/2) ; l'essai ne comporte aucun
glisser. C'est un intermittent de séquence : commenté ici, pas inscrit (aucun symptôme vécu).

**Vitest complet** : 932 fichiers, 11 911 essais verts (après le retrait des pauses fixes du banc neuf ; le premier
passage avait rougi la sentinelle des pauses, 625 pour 618).

**WebKit au verdict de la release** : dû à la fenêtre du 23 novembre.

## 6. Ligne de Nouvelles proposée

> Dans Alignement pédagogique, une activité glissée vite dans une leçon s'y range bien, à la souris comme au doigt ;
> elle ne reste plus à côté, ni dans une autre leçon.

Non écrite dans `js/changelog-data.js` : à valider.

## 7. Trouvailles et leurs issues

- « capture 25 » de parcours-5, intermittente à la ligne 421 : **inscrit, #1296**.
- « Raccourcis clavier » de `planif-menu-vue`, rouge une fois dans la série du module : **commenté ici et oublié**
  (vert seul, sans glisser).
- Les échecs « ailleurs » de parcours-5 sur `lot/deux-temps-modeles` (2 verts sur 3 sur trois commits) :
  **commentés ici et oubliés** ; ils précèdent la plage et sont absents de `main` aujourd'hui (3/3 avec le
  correctif).
