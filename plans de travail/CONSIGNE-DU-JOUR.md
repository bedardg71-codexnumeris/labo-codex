# Consigne du jour – l'inventaire des gestes qui suppriment pour de bon (#1007, lot de mesure)

> Écrite par Cowork le 2 octobre 2026 à 16 h 45 (Toronto, mesurée par `date`), sur `main` à `dfa56f9f` (1.174.5 en ligne). Remplace la consigne des mots du codex, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-02-1012-mots.md`. Commite d'abord, tels quels, les fichiers de Cowork qui traînent dans l'arbre. Le chantier du codex est clos ; on ouvre le point 2 de l'ordre (les lots isolés), dans l'ordre de Grégoire : celui-ci d'abord. Grégoire a dit « oui » à 16 h 45.

## Ce que Grégoire a décidé (sous #1007, 1er octobre, 9 h 50 et 9 h 51)

Ses mots : « Il faudrait toujours proposer à l'utilisateur de faire un Codex avant de supprimer quoi que ce soit, parce que c'est irréversible. » Tranché ensuite : l'application **exige** un codex à jour pour supprimer un trimestre ou un groupe ; elle le **propose** pour le reste ; l'inventaire dira, geste par geste, de quel côté chacun tombe ; les cas qui ne sont ni l'un ni l'autre lui reviennent.

## Ce que tu fais : mesurer, sans rien coder

**Aucun changement dans `js/`.** Le livrable est un fichier : `plans de travail/INVENTAIRE-2026-10-02-1007-gestes-qui-suppriment.md`.

1. **Trouve tous les gestes** qu'un usager peut faire et qui effacent quelque chose pour de bon (pas un changement de statut ; pas non plus une mise à la corbeille, mais le vidage de la corbeille, oui). Pars d'un `grep` sur ce qui retire (`db.remove`, `supprimerBlob`, `splice`, `filter` qui réécrit une liste, `localStorage.removeItem`, `indexedDB.deleteDatabase`, etc.) et remonte jusqu'au bouton. Au minimum : trimestre, groupe, élève (depuis 1.174.4, la fiche seule part ; ses données restent), production, évaluation, copie, annotation, intervention, rencontre, grille, échelle, cartouche, pratique, archive, corbeille, « Proposer un nettoyage », la remise à zéro de l'application. Et ce que tu trouveras.
2. **Pour chaque geste, une rangée** : où il se trouve à l'écran (chemin de menus) ; ce qui est effacé, et ce qui reste ; ce que l'écran dit avant (mot pour mot) ; s'il exige ou propose déjà un codex ; **si un codex à jour, rouvert, le rendrait** (oui, non, en partie : lu ou mesuré, dis lequel) ; et ta proposition de côté : **exige**, **propose**, ou **à Grégoire**.
3. **Mesure par le geste** ce qui peut l'être à faible coût (un banc jetable, retiré ensuite) ; le reste est lu. Dis pour chaque rangée le palier : mesuré, lu, inféré.
4. **La question restée ouverte**, à lui poser avec l'inventaire, sans la trancher : le codex habituel mis à jour, ou un fichier à part sous un autre nom (la proposition d'origine de #1007). Donne en trois lignes ce que chacun coûte, à l'écran et dans le code, et ce que tu recommandes.
5. **Ce que tu ne fais pas** : rien coder, rien inscrire de neuf sauf ce que tu trouves de cassé en chemin (issue 2, comme d'habitude). Les gestes déjà connus comme #1013 (masquer ce qui reste d'un élève supprimé) sont cités, pas refaits.
6. **Arrête-toi** une fois le fichier écrit et commité ; pas de release.

## Ce que tu rends

À Grégoire, trois lignes : combien de gestes, combien de chaque côté ; les cas qui lui reviennent, en gestes ; ta recommandation sur le codex habituel ou un fichier à part. Ce que tu as supposé, en une ligne.
