# Verdict de relecture – Les calculs, lot 4b (étape 4 du plan du 21 oct.)

> Cowork, mardi 27 octobre 2026, 09 h 39 (Toronto, mesuré par `date`). Relu : `c7a2e7fc`, `15c10b7e`, `174806a8` (33 fichiers), `2b1bef21` ; la demande de relecture ; `js/composeur-calcul.js` (le rendu en chaîne passe tout par `_esc`, les écouteurs sont délégués) ; dans `miroir-algo.js` la règle des copies de référence. `main` = `0053ce5d` (#1174 de l'autre instance par-dessus, accepté de son côté), non poussé.

## Verdict : accepté ; deux retouches, à faire en tête du lot 4c

Un calcul composé passe par le registre et l'évaluateur de 4a ; introuvable, il ne donne aucune note, sans repli ; « Retoucher » redonne la note du calcul tout fait sur plus de 5 000 cas ; rien ne s'écrit avant « Garder » ; la copie verrouillée garde sa note remise. Le compte brut est branché.

- **§ 2.1, le compteur `calculsProchain`** : accepté, c'est ce que demandait « ne se réemploie pas ».
- **§ 2.2, « Retirer » sur la carte non choisie** : accepté, sinon le geste n'aboutissait jamais.
- **§ 2.3** : accepté.
- **§ 2.4, les copies de référence** : **retouche 2** ci-dessous. Compter des réussites plutôt que des erreurs est un cas que le plan nomme (21 oct., « ailleurs, des réussites plutôt que des erreurs ») : c'est donc un symptôme de ce que le lot ouvre, pas une hypothèse.
- **§ 2.5, la réparation de #1142 sans `compte`** : **retouche 1** ci-dessous, plutôt que « commenter et oublier ». Elle écrit dans les données de Grégoire ; un calcul composé qui lit le compte brut y serait recalculé à faux. Le geste est court.
- **§ 3.1 à 3.5** : acceptées ; les textes de Claude Code conviennent.

## Les retouches

1. **`js/comptes-erreurs-stock.js`** passe `compte` (le compte brut qu'il répare) à `formulesAlgo.calculer`, comme les autres appelants. Son banc reste vert ; un essai neuf : un calcul composé qui lit `compte` y donne la même note qu'à l'évaluation.
2. **Les copies de référence d'un calcul dont la note ne baisse pas quand le compte monte.** Aujourd'hui, « Beaucoup » est le premier compte où la note touche le plancher, puis la moitié : pour un calcul qui récompense les occurrences, il vaut 1, et « Quelques » aussi. Règle : si la note ne baisse pas avec le compte (mesuré sur quelques comptes, comme la recherche le fait déjà), les copies se choisissent **par le compte, jamais par la note** : « Aucune » < « Quelques » < « Beaucoup », sans nommer aucune discipline. Choisis les nombres (par exemple à partir de la tolérance quand une limite est fixée) et dis-les dans la demande de relecture. Les trois calculs tout faits gardent leurs copies d'aujourd'hui, à l'octet.
