# Consigne du jour – #1007, lot 2b : le codex proposé avant de retirer une ligne qui porte des notes

> Écrite par Cowork le 3 octobre 2026 à 19 h 05 (Toronto, mesurée par `date`). Remplace la consigne de 17 h 48, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-03-bouton-coche-1.177.1.md`.
> Référence : `DECISIONS-2026-10-02-1007-suppressions.md` (§ 3), `INVENTAIRE-2026-10-02-1007-gestes-qui-suppriment.md` (§ 2.3, famille c), les deux verdicts de 2a.

## Où on en est

1.177.1 est en ligne. Les côtés « exige » (1.175.0) et « propose » (1.176.0, 1.177.0) sont livrés, portes passées. **Ce lot clôt #1007.**

**La décision de Grégoire** (§ 3, 2 oct., 20 h 25) : rien avant de supprimer une ligne d'éditeur, **sauf** si elle porte des notes d'élèves (un critère, un sous-critère, un niveau d'échelle ou une cible de dénotation **déjà employés dans au moins une évaluation**) : le codex est alors proposé. Le test « déjà employé » se mesure au moment du geste ; à toi de dire où le lire.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork et à écrire dans `BACKLOG.md`. **Ni push du code ni release** : relecture croisée d'abord (règle 2).

## 1 · Remesure, avant d'ouvrir

Pour chacune des quatre lignes (critère, sous-critère, niveau d'échelle, cible de dénotation) : où vit le geste (fichier, fonction, **toutes les portes**, éditeur de Conception et bibliothèques comprises) ; ce qu'il demande aujourd'hui ; **quand l'effacement s'écrit réellement** (au clic, par l'enregistrement automatique de la Conception depuis 1.164.0, ou à « Créer… » / « Enregistrer ») ; et **ce qu'il advient des évaluations qui l'emploient** (notes recalculées, coches orphelines, rétroactions). Rends-le en tableau. Signale toute autre ligne d'éditeur qui porterait des notes et que la décision n'a pas nommée : ne la branche pas, rends-la.

## 2 · Le test « déjà employé »

Une seule fonction par famille (ou une seule en tout, si la forme des données le permet), qui dit au moment du geste si la ligne est employée par au moins une évaluation **du trimestre où vit la grille ou l'échelle** ; dis comment tu traites une grille ou une échelle de la Bibliothèque partagée, employée dans plusieurs trimestres. Lecture seule, sans effet. La fenêtre ne paraît que si le test dit oui **et** si le codex n'est pas à jour. **Une ligne neuve, jamais enregistrée, ne propose jamais rien.**

## 3 · Le branchement

La même fonction `Codex.proposerAvantSuppression`, la même fenêtre, les mêmes boutons. Elle vient **avant** la question existante quand il y en a une (la cible de dénotation en a une : « Tu retires une cible déjà cochée… »), au geste sinon. **La leçon des verdicts** : ce qui est écrit après l'attente est relu après elle ; le tableau des portes dans ta demande. **L'enregistrement automatique** de la Conception : dis comment l'attente s'insère sans qu'une sauvegarde différée écrive la ligne retirée pendant qu'elle dure, ni la perde après un « Annuler ».

## 4 · Les mots

Une première phrase par geste dans `PROPOSITIONS_AVANT_SUPPRESSION`, sur le modèle accepté, **sans autre mot neuf**. Elles sont à Grégoire : propose-les en tableau. Si dire le nombre d'évaluations concernées te paraît nécessaire (« déjà employé dans N évaluations »), propose-le comme variante à part, il tranchera.

## 5 · La preuve

- La sentinelle de 2a s'étend : registre, compte, forme de la ligne ; et pour chaque famille, un essai qui démontre que **la fenêtre ne paraît pas** quand la ligne n'est employée par aucune évaluation.
- Le banc WebKit : au moins un critère employé (fenêtre, « Annuler » ne retire rien, rien n'est écrit) et un critère non employé (aucune fenêtre) ; une cible de dénotation cochée (la fenêtre avant la question existante).
- Mutations démontrées rouges ; Vitest complet ; bancs voisins de la Conception lancés (doublure « codex à jour » si le banc juge autre chose). Pas de verdict Playwright complet : il viendra avec la release.

## 6 · Ce que tu rends

1. Commit sur une branche locale `claude/1007-lignes-notes`, non poussée ; l'arbre principal laissé sur `main`.
2. `plans de travail/DEMANDE-RELECTURE-2026-10-03-1007-lignes-notes.md` : en tête, pour Grégoire, trois lignes en gestes d'utilisateur ; puis la remesure, le test « déjà employé », le tableau des lectures, les phrases proposées, la ligne des Nouvelles, ce que tu as supposé.
3. `RELAIS.md` à jour.

À Grégoire, trois lignes : ce que le lot fera à l'écran ; ce qui l'attend ; ce que tu as supposé.
