# Consigne du jour – #947 : dans la visionneuse, la mémoire des derniers choix ne touche plus une copie déjà évaluée

> Écrite le 25 septembre 2026, vers 11 h 45 (Toronto), par Cowork, sur `origin/main` = `9eb4edac` (1.159.5, en ligne chez Netlify depuis 11 h 31, mesuré). **À remesurer avant tout code.**
> La précédente (#945, livrée en 1.159.5) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-25-bug-945-entree.md` (déplacée par Cowork, à commiter avec ce lot).
> **Troisième lot du cap du 24 sept. au soir** (« terminer tout ce qui concerne la rétroaction »). La fiche existe : **#947** (trouvaille de #946, inscrite sur la disposition de la relecture de Cowork). Symptôme non vécu.

## 0 · La règle qui décide – déjà posée par Grégoire

**Ce qui est enregistré avec l'évaluation fait foi** (#939, appliquée en #946). La mémoire des derniers choix (`dernieresSelectionsEvaluation`) sert à pré-remplir une copie **sans** évaluation ; sur une copie évaluée, elle ne pose ni grille, ni échelle, ni cartouche. Une copie évaluée sans cartouche reste sans cartouche – c'est aussi ce que font désormais « Consulter » et le menu « Production » (#946). Aucune question à Grégoire.

## 1 · Ce que Cowork a lu (lecture seule, sur `9eb4edac` – non exécuté)

- `js/travaux-ui.js` ≈ l. 5086-5172 (ouverture de la visionneuse) : `selectionsCache` est lu avant le chargement (≈ l. 5091) ; à +2,5 s puis +0,2 s, la grille (≈ l. 5152), l'échelle (≈ l. 5163) et la cartouche (≈ l. 5166, par `poserCartoucheParChargeur`, donc sans confirmation #944) sont posées **si leur menu est vide**. Sur une copie évaluée sans `cartoucheId`, `_chargerCartoucheDropdownModif` (`js/evaluation.js` ≈ l. 1398) laisse le menu vide : la cartouche mémorisée – venue d'une autre copie, peut-être d'une autre production – y entre, `cartoucheSelectionnee` l'écrit dans `evaluationEnCours`, et « Enregistrer » (qui lit le menu, `evaluation.js` ≈ l. 1790) l'écrirait dans l'évaluation.
- Même question pour l'échelle : une évaluation sans `echelleId` hors grille en points. Mesure-la et traite-la par la même règle.
- **Code mort du même mécanisme** : `restaurerSelectionsEvaluation` (`js/evaluation.js` ≈ l. 488) n'a **aucun appelant** (grep sur `js/` et `index.html`) et pose la cartouche mémorisée sans aucune garde. Remesure ; s'il n'a toujours aucun appelant, retire-le dans ce lot (zéro-dette : même mécanisme, et il réécrirait le défaut s'il se réveillait). S'il en a un, applique-lui la même règle.

## 2 · Le lot

1. **Mesure d'abord, en WebKit, par la vraie visionneuse** : une copie évaluée sans cartouche, après avoir évalué une autre copie avec une cartouche (la mémoire en porte une). Note ce que montre le menu à +3 s et ce qu'« Enregistrer » écrit.
2. **Si le défaut se reproduit** : la restauration de la visionneuse ne s'applique qu'à une copie sans évaluation enregistrée. Réutilise le lecteur de #939/#946 (`_evaluationEnregistreeDeLaCopie`) plutôt qu'une troisième recherche ; la forme est à toi.
3. **S'il ne se reproduit pas** : la fiche se ferme par la mesure, avec un essai qui fige le comportement, et le retrait du code mort seul (sans release si rien ne change à l'écran).

## 3 · Limites

- **Tarir n'est pas réparer.** Des évaluations ont peut-être déjà reçu une cartouche mémorisée ; rien ne permet de les reconnaître. **Aucune donnée réécrite** ; stock assumé, écrit dans la fiche.
- Une copie **sans** évaluation garde la restauration telle qu'elle est (grille, échelle, cartouche, remise, options d'affichage).
- Ne touche ni #944 (« Changer de cartouche ») ni #946 (`_cartoucheModelePourLaCopie`).
- Aucun nom d'élève réel dans les bancs ni dans le rapport (règle 6).

## 4 · Preuve attendue

- WebKit : le cas du § 2.1, rouge sur `9eb4edac` par le symptôme exact, vert après ; une copie sans évaluation reçoit toujours la cartouche mémorisée ; une copie évaluée avec sa cartouche la garde.
- Si le code mort part : un essai ou une sentinelle qui rougit s'il revient (au choix).
- Break-tests de ton choix, chacun rouge ; nomme-les.
- « Nouvelles » (seulement s'il y a correctif) : **proposition de Cowork, à soumettre à Grégoire avant le push** : « Évaluer : dans la visionneuse, une copie déjà évaluée ne reçoit plus la dernière grille, échelle ou cartouche que tu as utilisée ailleurs ; elle garde ce qui a été enregistré avec elle. »
- Relecture croisée de Cowork avant la fusion (le lot touche ce qui s'écrit dans une évaluation) : branche, `DEMANDE-RELECTURE-2026-09-25-bug-947.md`, puis verdict, fusion, push.

## 5 · Porte terrain

**Aucune.** Une machine répond.
