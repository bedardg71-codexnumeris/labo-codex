# Verdict de relecture – Évaluer relit la grille, la note part du poids d'aujourd'hui (#1215)

> Cowork, dimanche 1er novembre 2026, 9 h 31 (Toronto). Relu : `abf256ee` (diff de `js/evaluation-calcul.js`, `js/evaluation-handlers.js`, `js/evaluation-chargement.js`, jetons d'`index.html`) et `RAPPORT-2026-11-01-evaluer-relit-la-grille.md`.

## Verdict : accepté, sans retouche

- La mesure est en tête, comme demandé, et elle tranche : la note enregistrée partait de l'ancien poids, le PDF l'imprimait, et le bouton n'était pas à l'abri (points plafonnés à l'ancien maximum). La source est tarie par `parametresDuCritere`, qui lit la grille et ne retombe sur les attributs que sans grille : aucune note ne change parce qu'une grille manque.
- Rebâtir plutôt que mettre à jour en place : juste, pour les raisons données (critère ajouté ou retiré, type changé, barème). Le compteur `_chargementsEvaluationEnCours` fait taire l'enregistrement que les rendus armeraient ; un enregistrement déjà en attente repart avec l'état relu. Rien ne s'écrit à la relecture : conforme à la consigne.
- Vérifié par Cowork dans le code :
  - `fige` (« un champ désactivé dans la zone ») : seul `desactiverFormulaireEvaluation` désactive des champs de `listeCriteresGrille1` (`grep` sur `js/` : rien dans les rendus, ni pour une copie non recevable, ni pour « travail en cours »). Une copie déverrouillée ne peut donc pas se retrouver figée par la relecture.
  - « Comme à une réouverture » tient aussi pour les points : à l'ouverture, les points sont reposés puis relancés par l'événement de la frappe (`evaluation-chargement.js` vers 961), donc plafonnés par `pointsSaisis`. La relecture fait la même chose.
- Contre-épreuves : 21 mutations, toutes rouges, M12 comprise au second passage. La reprise après le redémarrage est établie (diff identique à l'octet à l'instantané, aucune mutation restée).

## Les suppositions nommées

3. **Points ramenés au nouveau maximum quand le poids baisse, formulaire ouvert** : acceptée, c'est la règle du lot 2 (« le maximum EST le poids ») et ce que fait déjà l'ouverture. ⚠ La règle elle-même pose une question de didactique, antérieure à ce lot : 35 points sur 40, poids ramené à 30, donne 30 sur 30. Elle relève de Grégoire (ce qu'une note veut dire), mais n'est pas ouverte par ce lot et n'a aucun symptôme vécu (règle du 24 août) : gardée ici, sans fiche, à lui soumettre si le cas se présente.
4. **Une copie verrouillée montre les poids d'aujourd'hui dans ses en-têtes** : acceptée. La note remise, la base et le texte ne bougent pas, et c'est l'esprit de la décision du 27 oct. (la note remise, plus la ligne du calcul actuel).

## Les trouvailles et leur issue

1. **Le cliquet des pauses de `lot/pauses-apres-ouverture`** (918 pour un plafond de 904, mesuré sur une copie) : **décision de Cowork, inscrite pour la fusion**. La session qui fusionne la branche (après la mise en ligne de ce soir) remplace par une attente ce qui a une condition observable dans les specs arrivées sur `main` depuis la bifurcation (#1213, #1214, #1215 et les lots suivants du jour), puis relève le plafond du compte exact des fenêtres « rien n'est écrit », chacune nommée dans le commit. Précédent : la branche a elle-même gardé une telle fenêtre à 9 h (901 → 904). À porter dans la consigne de fusion.
2. **Le stock** : rien n'est réparé, et c'est juste. Repérable pour l'algorithmique, pas pour les points plafonnés ; démo : 0 sur 101. **Remonté à Grégoire** (ses données réelles), réponse à 10 h 35 : cet automne, il n'a changé que des intitulés et des descriptions de critères, aucune pondération. **Rien à chercher** dans son codex ; un renommage ne touche ni les identifiants ni la note.
3. **`liste-651`, rouge une fois, non reproduit** : issue 3, acceptée. S'il rougit seul au verdict du soir, on le dit, on ne retient pas la version pour lui.
4. **Une autre session tournait** : erreur de prévision de Cowork, notée. Les durées du lot en sont touchées, pas ses verdicts.
5. **Le verdict de #1214** (`VERDICT-RELECTURE-2026-11-01-palette-evaluation-un-defilement.md`) n'était pas commité : la consigne suivante (barre d'outils) le commite avec celui-ci, à son étape 0.

## Geste à vérifier sur l'iPad, après la mise en ligne

Celui du rapport : dans Évaluer, choisir un niveau, aller changer une pondération dans la grille, revenir ; le niveau choisi est toujours là, et la pondération affichée est la nouvelle.
