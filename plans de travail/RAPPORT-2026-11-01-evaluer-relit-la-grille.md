# Rapport – Évaluer relit la grille quand elle change, sans perdre la saisie (#1215, 1er novembre 2026)

> Pour Cowork, en relecture. Commit sur `main`, **pas de push**, pas de release. `SUIVI-BUGS.md` : aux corrigés, « codé, pas en ligne ». Le Mac a redémarré pendant le lot : une session de reprise a relu le diff et terminé. Consigne : `CONSIGNE-LOT-2026-11-01-evaluer-relit-la-grille.md`.

## En tête : ce que la mesure a établi

**Oui, une note enregistrée partait de l'ancienne pondération, et le PDF l'imprimait.** Le bouton n'était pas à l'abri : il corrigeait l'algorithmique et le niveau, pas les points plafonnés à l'ancien poids.

Parcours : la copie est ouverte en Évaluer, les poids passent de 50/20/30 à 30/30/40, retour sans rouvrir la copie, puis un geste. Mesuré en WebKit, par une sonde retirée depuis, sur une copie jetable de `d9c5f57d` (avant) et du correctif (après).

| Geste après le détour | Enregistré par | Note avant | Note après | Ligne du PDF avant | Ligne du PDF après |
|---|---|---|---|---|---|
| Algorithmique, 3 erreurs | automatique | **74,25** | 75,5 | **17,50/30** (87,5 %) | 27,50/30 (91,7 %) |
| Algorithmique, 3 erreurs | bouton | 75,5 | 75,5 | 27,50/30 | 27,50/30 |
| À niveau, E | automatique | **80** | 80,83 | **18,33/30** (91,7 %) | 28,33/30 (94,4 %) |
| À niveau, E | bouton | 80,83 | 80,83 | 28,33/30 | 28,33/30 |
| Analytique, 35 points (ancien maximum 30, nouveau 40) | automatique | **81,5** (30 points) | 87,33 (35 points) | **18,33/30** | 28,33/30 |
| Analytique, 35 points | bouton | **82,33** (30 points) | 87,33 (35 points) | 28,33/30 | 28,33/30 |
| Rétroaction seule | automatique | **82,33** | 76,33 | **18,33/30** | 28,33/30 |
| Aucun geste | rien | 82,33, poids 50/20/30 | identique | 18,33/20 | identique |

La référence, une copie ouverte après le changement de grille, donne 75,5 et 27,50/30 pour les 3 erreurs. Les autres lignes « après » concordent avec le bouton ou avec le calcul à la main (87,33 = 24 + 28,33 + 35).

**Le nom du critère** (« pas établi » au rapport de #1213) : le formulaire montrait l'ancien poids dans l'en-tête ; il montre le nouveau. Le nom suit le même rendu, éprouvé seulement pour le nom de la grille dans son menu. Le renommage d'un critère n'a pas d'essai propre.

**Lecteurs de poids au DOM** : `dataset.ponderation` et `dataset.facteur` n'étaient lus que par les deux handlers ; `champ.max` seulement par `pointsSaisis` (`grep` sur `js/`). Les trois lisent maintenant la grille.

## À trancher par Cowork : le cliquet des pauses de `lot/pauses-apres-ouverture`

**Mesuré sur une copie jetable** de la branche (`3390fb84`), avec les specs de `main` : sa sentinelle passe à 904 pauses sans cette spec, et **rougit à 918 avec elle**. La spec compte 14 pauses, dont 5 appels de `attendreEcriture`. Le plafond doit égaler le total, et son commentaire dit « ne se relève pas ».

Je n'ai pas réécrit la spec. Six de ces pauses sont des fenêtres « rien n'est écrit », sans condition observable pour les remplacer. La branche a elle-même gardé une telle fenêtre, et son plafond est passé de 901 à 904 à 9 h. Les lots suivants du groupe ajouteront peut-être d'autres specs. **Issue : inscrit ici, à régler à la fusion** ; pas une fiche, faute de symptôme vécu.

## Ce qui est fait

- **La source** (`js/evaluation-calcul.js`, `js/evaluation-handlers.js`, `pointsSaisis`) : `parametresDuCritere` lit le poids et le facteur dans la grille d'aujourd'hui. Les attributs ne servent que si la grille est introuvable. Tient même pour une écriture de grille qui n'annonce rien (`materiel-creation.js`).
- **L'affichage** (`js/evaluation-chargement.js`, `relireGrilleDuFormulaire`) : à `donnees-enregistrees` sur `cle('grillesTemplates')`, en mode Évaluer, le formulaire se rebâtit puis reprend sa saisie.
- **Un enregistrement déjà en attente** repart avec l'état relu, pas avec son ancien instantané. La relecture n'en arme aucun.
- **Critère ajouté ou retiré** : les avis #652 et #705 le disent, comme à l'ouverture, et la saisie des autres critères reste.

## Ce que j'ai décidé, et supposé

1. **Rebâtir, pas mettre à jour en place** : par les deux rendus existants, puis la saisie est rendue. Une mise à jour en place n'aurait suivi ni un critère ajouté ou retiré, ni un type changé, ni un barème, et aurait fait un troisième rendu.
2. **Un texte généré suit la nouvelle note, à l'écran seulement** ; il s'écrit au prochain geste. Un texte tapé reste au mot près (marque #961). Comme à tout recalcul, aucun mot neuf.
3. **Le poids baisse sous les points saisis** : ramenés au maximum à l'écran, comme à l'ouverture (lot 2, « le maximum EST le poids »). Le chiffre plafonné s'écrit au prochain geste. *Supposé* : c'est bien la règle voulue quand la baisse arrive formulaire ouvert.
4. **Une copie verrouillée** : la note remise, le texte affiché et la base ne bougent pas, les champs restent figés. Ses en-têtes et son maximum montrent la grille d'aujourd'hui, comme à une réouverture. *Supposé* : cet affichage ne contredit pas la décision du 27 oct., puisque rien de remis ne change.
5. **Grille supprimée, rien de bâti, chargement en cours** : aucune relecture ; le formulaire reste tel quel.

## Source ou stock

**La source est tarie, le stock n'est pas touché** : rien n'est écrit, rien n'est réparé.

- **Repérable pour un critère algorithmique** : `noteCalculee` diffère de la formule refaite avec le poids enregistré à côté (`criteres[].ponderation`). Le témoin de la mesure, 17,5 sur 30 pour 3 erreurs sur 600 mots, est bien signalé.
- **Pas repérable** : des points plafonnés à l'ancien poids (30 au lieu de 35 ressemble à une vraie saisie).
- **Pas un bon signe** : une note qui diffère du calcul de la grille actuelle. Toute copie enregistrée avant un changement de grille la montre, légitimement (ligne « Aucun geste »).
- **Démo** : 101 évaluations, 3 non verrouillées, dont 2 avec un critère algorithmique. **0 signalée**, parmi les non verrouillées comme parmi toutes.
- **Le codex de Grégoire n'est pas mesuré** : c'est à lui de le décider, par Cowork.

## Vérifié comment

- **Le banc** `tests/integration/evaluer-relit-la-grille-1215.spec.js` : 15 essais, deux fois chacun, 30 verts (WebKit).
- **Vitest entier** : 863 fichiers, 10 615 verts.
- **Bancs voisins** (14 specs d'Évaluer, du barème, du verrou, des analytiques, et #1213) : 68 verts, 2 sautés, WebKit.
- **21 contre-épreuves, toutes rouges** :
  - Premier passage, sur 13 essais, code inchangé depuis hors déplacement d'un JSDoc : M1 à M17, 16 rouges et **M12 a survécu**. Non rejouées après les ajouts au banc, qui ne font qu'ajouter.
  - Second passage, au premier plan, une à la fois, reporter JSON, fichier rétabli à l'octet et vérifié par `cmp` :

| Mutation | Essai rouge | Assertion |
|---|---|---|
| M12, le texte généré ne suit pas (survivante) | un niveau choisi à la main | « le texte généré dit la note du niveau choisi » |
| M18, chargement en cours non attendu | rien à relire sans risque | « chargement en cours » |
| M19, rien de bâti : rebâtit quand même | rien à relire sans risque | le texte d'attente reste |
| M20, grille supprimée : rebâtit quand même | rien à relire sans risque | « grille supprimée » |
| M21, plus de note remise | les deux essais du verrou | « la note remise reste à l'écran » |

- **Reprise après le redémarrage** : le journal de la session perdue montre qu'elle a été coupée pendant la répétition du banc, avant la première mutation du second passage. `evaluation-chargement.js` n'avait pas été écrit depuis la fin du premier. Le diff des quatre fichiers était identique à l'octet à l'instantané d'avant les contre-épreuves. **Aucune mutation n'était restée.** La mesure « avant » rejouée donne un JSON identique à celui de la session perdue.
- **Retouche de la reprise** : le JSDoc de `pointsSaisis` s'était retrouvé collé à `_maxDesPoints` ; remis à sa place. Ajout de la mesure au bouton pour le niveau et les points, absente de la sonde, et d'un essai : copie verrouillée, poids baissé sous ses points. Les jetons anti-cache de ce lot portaient le 1er nov. ; la sentinelle, qui ne juge qu'après le commit, exige le jour du build (31 oct.) : passés à `20261031a`, comme #1213 et #1214.

**Pas encore** : la vérification complète du navigateur, Chrome, l'iPad, le vrai codex. Le renommage d'un critère n'a pas d'essai propre.

## Trouvailles

- **Un rouge non reproduit, issue 3 (noté, sans suite)** : `liste-651`, « garde : après Annoter, Consulter… », rouge une fois dans les bancs voisins de la session perdue (journal). Vert depuis : 1 + 24 répétitions cette session-là, et dans le passage d'aujourd'hui. Cause non établie.
- **Une autre session tournait pendant ce lot** : `lot/pauses-apres-ouverture` a reçu `3390fb84` à 9 h, et un Playwright y tournait à 9 h 11, dans son propre arbre. Rien de cet arbre ne touche `main`. Le lot d'ici a tourné sur une machine partagée, ce qui peut compter pour les durées, pas pour les verdicts.

## Geste à vérifier sur l'iPad, après la mise en ligne

Dans Évaluer, choisir un niveau, aller changer une pondération dans la grille, revenir : le niveau choisi est toujours là, et la pondération affichée est la nouvelle.
