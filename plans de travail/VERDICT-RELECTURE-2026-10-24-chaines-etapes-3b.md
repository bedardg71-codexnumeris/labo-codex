# Verdict de relecture – les chaînes d'étapes, lot 3b : échelles, cartouches, productions, pratiques (#1149)

> Cowork, samedi 24 octobre 2026, 20 h 54 (Toronto). Relu : le rapport de Claude Code relayé par Grégoire, `998e73c1` (la chaîne de la pratique et le correctif de `onMatEchelleIdChange`, lus au diff), les captures Productions à régler (820, clair) et Échelles à régler (1440, sombre), la ligne #1144 de `Retours des testeurs/SUIVI-BUGS.md`.

## Verdict : **accepté**

Les quatre chaînes sont celles que Grégoire a validées, les clics conduisent sans écrire (un essai compare tout le stockage avant et après), et les captures montrent les états lisibles : « trou à 59 % » en attention, « à écrire », « à planifier » sans couleur.

## 1. Les décisions prises seul : acceptées

| Décision de Claude Code | Décision de Cowork |
|---|---|
| Le portfolio conteneur n'a pas de chaîne | **Accepté.** Ni grille ni date : une chaîne « à régler » pour toujours mentirait. |
| Le niveau 0 et les bornes vides hors des Pourcentages | **Accepté.** C'est la règle de `niveauDuPourcentage` (`sansNiveauZero`, bornes non numériques écartées), que la consigne demandait de suivre. |
| La méthode lue comme le calcul de la note la lit | **Accepté.** Une seule lecture de la méthode dans l'app. |
| **Le menu « Échelle à utiliser » enregistre au changement** | **Accepté par Cowork, pas besoin de Grégoire.** Ce n'est pas une écriture d'office dans ses données : rien ne s'écrit sans qu'il choisisse une échelle, et le choix s'écrivait déjà si un autre champ changeait (`configuration.echelleId`, l. ~1610). Le geste dit enfin ce que l'écran montre (règle du lot E1). Aucun stock à réparer. |
| Le compte de complétion des cartouches retiré | **Accepté.** Il écrivait dans des éléments absents et comptait les niveaux de toutes les échelles : du code faux, remplacé par le compte de la chaîne (zéro dette). |

## 2. La trouvaille : « + Nouvelle cartouche » renomme la cartouche ouverte

Mesurée par Claude Code (§ 5 de sa demande) : cartouche A ouverte, « + Nouvelle cartouche », nommée B, « Créer » : une seule cartouche reste, B, avec les commentaires et l'id de A.

**Hypothèse de Cowork (inférence, non mesurée) : c'est le mécanisme (1) de #1144**, le geste « non identifié » qui a écrit « Plan de rédaction (refonte A26) » sous une seconde grille. La ligne #1144 décrit : la même cartouche, **même id**, sous deux clés de grille, `grilleId` changé, critères non remappés, sans retrait de la source, la piste étant « un enregistrement depuis l'éditeur de cartouches après un recalage du `grilleId` ». Si, dans la fiche de la « nouvelle » cartouche, on choisit une **autre grille** avant « Créer », le défaut mesuré écrirait l'id de A sous la clé de cette autre grille et laisserait A sous la sienne : exactement les deux copies trouvées chez Grégoire.

**Issue : corriger maintenant** (proposé à Grégoire) : ce geste touche ses données réelles et peut faire disparaître une cartouche qu'emploient des évaluations. Le lot doit d'abord **reproduire la variante « autre grille »** au banc, avant correctif ; si elle reproduit les deux copies, #1144 est fermée pour sa source. Stock : non réparé d'office (la console de #1144 existe déjà).

## 3. Portes terrain

D'accord : aucune porte due.

## 4. Encore ouvert, hors de ce lot

Le rouge de GitHub sur la 1.217.0 (avant le prochain push) ; le lot « correction : noms fictifs », consigne écrite, non exécuté.
