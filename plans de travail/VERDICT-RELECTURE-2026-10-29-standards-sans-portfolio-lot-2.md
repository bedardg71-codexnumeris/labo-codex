# Verdict de relecture – Des standards sans portfolio, lot 2 : les lecteurs secondaires lisent le même pool (#1178)

> Cowork, jeudi 29 octobre 2026, 8 h 14 (Toronto, mesuré par `date`), sur `main` = `3be243f5`. Lu : le rapport de Claude Code, la liste des fichiers d'`aaa37857`, `obtenirIdsPoolStdDuCorpus` (`js/pratiques/pratique-registre.js:832`), le diff des deux harnais de test, l'absence d'appelant de `genererSectionCompletion` au commit d'avant (`2d5a5711` : sa seule occurrence est sa définition). Vitest et Playwright non rejoués.

## Verdict

**Accepté sans retouche.**

- **Une seule définition** : `obtenirIdsPoolStdDuCorpus` ne fait qu'identifier la terminale et déléguer à `obtenirArtefactsIdsPoolStd` ; aucune logique recopiée.
- **Les harnais** reçoivent le **vrai** registre (chargé dans un bac à part), pas un bouchon : les 41 essais qui tombaient en erreur lisent le pool réel, ce qui n'affaiblit aucun essai.
- **`genererSectionCompletion`** et **`calculerPerformanceRecente`** : sans appelant, retirées. Juste (zéro dette).
- **L'écart sur l'export recherche est accepté** (décision de Cowork, dite à Grégoire) : une diagnostique de type « Artefact » sort de l'export comme elle sort déjà de la note et des autres lecteurs (#883, #1055 : une diagnostique ne compte pas). Les clés du format ne changent pas ; si une diagnostique de Grégoire est de type « Artefact », la numérotation des artefacts de l'export commence désormais au premier vrai artefact. Comme chaque export tire une nouvelle clé, deux exports ne se comparent déjà pas par leurs codes d'étudiant·es ; le seul risque est un export déjà transmis à quelqu'un avec l'ancienne numérotation : à dire à Grégoire.
- **Les mots notés pour le lot 5 du plan** (« N artefacts remis », « N meilleurs artefacts », « Performance du portfolio actuel » écrit en dur) : rien changé, juste.
- **Les trouvailles** : les deux inscrites (#1178) et la non inscrite (« ≥ Min. » sous une pratique sommative, lue sans mesure ni symptôme vécu) suivent les règles de `CLAUDE.md`.

Le chantier passe au lot 3 du plan (les Productions ne poussent plus vers une terminale) ; ses mots neufs reviennent à Grégoire avant le code. D'ici là : les jetons par défaut, puis le guidage de la démo.
