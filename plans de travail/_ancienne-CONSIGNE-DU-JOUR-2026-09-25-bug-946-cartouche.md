# Consigne du jour – #946 : à l'ouverture d'une copie déjà évaluée, la cartouche de la copie fait foi

> Écrite le 25 septembre 2026, 10 h 10 (Toronto), par Cowork, sur `origin/main` = `aa5579e8` (1.159.3). **À remesurer avant tout code.**
> La précédente (#940, livrée en 1.156.4) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-24-lot-940-bilan.md` (déplacée par Cowork, à commiter avec ce lot).
> **Premier lot du cap posé par Grégoire le 24 sept. au soir** : « terminer tout ce qui concerne la rétroaction dans les prochains lots » (`FILE-DES-LOTS.md`, section du 24 sept. au soir). La fiche existe : **#946** (trouvaille du lot #944). Pas de nouvelle fiche à inscrire pour le lot lui-même.

## 0 · La règle qui décide – déjà posée par Grégoire

**Ce qui est enregistré avec l'évaluation fait foi** (sa règle de #939, le 24 sept.). Appliquée ici : sur une copie qui a une évaluation enregistrée, la cartouche affichée à l'ouverture est celle de l'évaluation, jamais celle que la production prévoit. La cartouche du modèle ne sert qu'à pré-remplir une copie **sans** évaluation. Aucune question à lui poser sur ce point.

## 1 · Ce que Cowork a lu (lecture seule, sur `aa5579e8` – non exécuté)

- `chargerProduction` (`js/evaluation-chargement.js` ≈ l. 696) : pose la cartouche du modèle (≈ l. 736), puis à +100 ms `verifierEtChargerEvaluationExistante` (`js/evaluation.js` ≈ l. 575) pose la cartouche de l'évaluation **sans événement `change`** (≈ l. 665 de ce fichier), puis à +300 ms `_selectionnerCartoucheProduction(refModele.cartoucheId)` (≈ l. 743) **repose la cartouche du modèle**, par `poserCartoucheParChargeur` (donc aucune confirmation #944) et `cartoucheSelectionnee` (≈ l. 1003) l'écrit dans `evaluationEnCours.cartoucheId`. « Enregistrer » l'écrirait ensuite dans l'évaluation (l'auto-save, lui, ne touche pas `cartoucheId`, ≈ l. 1870).
- **Pourquoi le défaut est peut-être rare** – ta relecture #944 l'a vu (`RELECTURE-2026-09-24-bug-944.md`, § « Ce que j'ai vérifié sur la trouvaille #946 ») : `_modeleProductionPourEval` (≈ l. 664) ne retient la cartouche des évaluations que si TOUTES s'accordent ; en état mixte, il rend `''` et rien n'est reposé.
- **Le cas que Cowork croit réel, à prouver ou à réfuter** : quand les évaluations d'une production n'ont pas toutes la même **grille**, `_modeleProductionPourEval` retombe sur `production.grilleId / cartoucheId`. Une copie évaluée avec la grille de la production mais une **autre** cartouche de cette grille verrait alors la cartouche de la production reposée à +300 ms (l'option existe dans le menu). Idem si la production porte une cartouche et qu'aucune évaluation n'a de `grilleId`.
- **Second chargeur à mesurer** : `demarrerEvaluationDepuisFichier` (≈ l. 629-640) pose lui aussi la cartouche du modèle, en boucle de huit essais. Dis s'il peut atteindre une copie déjà évaluée, et dans quel ordre par rapport au chargement de l'évaluation.

## 2 · Le lot

1. **Mesure d'abord, en WebKit** : reproduis le cas du § 1 (production aux grilles mixtes, copie évaluée avec une autre cartouche que celle de la production) par le vrai menu « Production ». Note ce que montre le menu et ce qu'« Enregistrer » écrit.
2. **Si le défaut se reproduit** : corrige à la source, selon la règle du § 0, pour **tous** les chargeurs qui posent la cartouche du modèle sur une copie (au moins les deux du § 1). Zéro-dette : si la réapplication à +300 ms ne sert plus qu'à contourner un écrasement, retire-la plutôt que de la garder. La forme du correctif est à toi.
3. **Si aucun chemin ne reproduit le défaut** : la fiche se ferme **par la mesure**, sans code applicatif. Laisse un essai qui fige le comportement (il doit rougir si on force le modèle sur une copie évaluée), coche #946 avec la phrase qui dit pourquoi, et pas de release.

## 3 · Limites

- **Tarir n'est pas réparer.** Des évaluations ont peut-être déjà été enregistrées avec la cartouche de la production au lieu de la leur ; rien ne permet de les reconnaître. **Aucune donnée réécrite.** Écris-le comme stock assumé dans le rapport et dans la fiche.
- Ne touche pas au geste #944 (« Changer de cartouche », sa confirmation, `_remplacementConfirme`) ni à la règle #939 du commentaire enregistré.
- #945 (Entrée confirme une confirmation « danger ») est le lot suivant, pas celui-ci.
- Aucun nom d'élève réel dans les bancs ni dans le rapport (règle 6).

## 4 · Preuve attendue

- WebKit : le cas du § 1, rouge sur `aa5579e8` par le symptôme exact (le menu montre la cartouche de la production ; ou l'évaluation enregistrée change de `cartoucheId`), vert après. Plus : une copie **sans** évaluation reçoit toujours la cartouche du modèle ; une copie évaluée dans l'état mixte de #944 garde la sienne.
- Break-tests de ton choix, chacun rouge ; nomme-les.
- « Nouvelles » (seulement s'il y a correctif) : **proposition de Cowork, à soumettre à Grégoire avant le push** : « Ouvrir une copie déjà évaluée garde la cartouche avec laquelle elle a été évaluée, même quand la production en prévoit une autre. »
- Relecture croisée de Cowork avant la fusion (le lot touche ce qui s'écrit dans une évaluation) : branche, `DEMANDE-RELECTURE-2026-09-25-bug-946.md`, puis verdict, fusion, push.

## 5 · Porte terrain

**Aucune.** Une machine peut répondre, et Grégoire ne crée pas de données fictives pour vérifier un geste. Si le correctif change ce qu'il voit en ouvrant une de ses copies, dis-le en une phrase dans le rapport.
