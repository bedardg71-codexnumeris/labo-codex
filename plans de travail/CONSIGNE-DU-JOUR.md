# Consigne du jour – corriger, puis mettre en ligne le codex proposé (#1007, 2a-1)

> Écrite par Cowork le 3 octobre 2026 à 7 h 56 (Toronto, mesurée par `date`). Remplace la consigne de 3 h 34, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-03-1007-second-lot-2a.md`.

## Où on en est

Ton commit `22de2db9` est relu : **vert sous une correction**. Lis `plans de travail/VERDICT-RELECTURE-2026-10-03-1007-propose-codex.md` en entier. **Grégoire a accepté les mots** (« oui », 7 h 56) : les variantes du § 4 de ta demande telles quelles ; les mots du § 5 avec une retouche (sans codex actif, le bouton du milieu dit **« Supprimer sans codex »**) ; la ligne des Nouvelles du § 7 telle quelle. **On livre 2a-1 seul** ; 2a-2 reste inscrit pour le lot suivant.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md`, à pousser, et à retirer le worktree `1014-codex-complet`. Si le garde de permissions refuse, arrête-toi sur ce seul point et dis-le-lui.

## Ce que tu fais, dans cet ordre

1. **Commite** les fichiers de Cowork tels quels (ce fichier, l'archive, le verdict), et pousse les commits de documents de `main`.
2. **La correction du verdict**, sur `claude/1007-propose-codex` : le tableau des 36 portes (ce qui est écrit après l'attente vient-il d'une lecture faite avant ?), la relecture après l'attente là où il le faut, sans changer un texte ; l'essai de banc qui rougit sur l'ancien code. Démontre qu'il rougit (mutation : retire la relecture de `supprimerEvaluation`).
3. **La retouche de mots** : sans codex actif, « Supprimer sans codex ». Rien d'autre ne change dans les mots.
4. **La release** : **minor** (1.176.0), la ligne des Nouvelles telle quelle, son titre à toi selon l'usage du fichier ; dis-le dans ton rendu.
5. **Verdict Playwright complet, puis push, puis fusion vers `main`** (règle 2). Un banc bloqué par la fenêtre (le risque que tu as nommé) : doublure « codex à jour » si le banc juge autre chose, comme tu l'as fait ; toute autre correction de code, arrête-toi et rends-la à Cowork.
6. **Constate la mise en ligne chez Netlify** (par le connecteur, pas par `curl`), et dis l'heure mesurée.
7. **La porte terrain, le markdown** : `plans de travail/PORTES-TERRAIN-2026-10-03-1007-propose-codex.md`. Cowork publiera l'artefact jumeau. Dans Chrome sur le Mac, **en fenêtre privée**, sans ses vraies données : un espace neuf (aucun codex) ; une évaluation ou une production à supprimer : la fenêtre « Écrire un codex avant de supprimer ? », ses trois boutons ; « Annuler » ne supprime rien ; « Supprimer sans codex », puis la question habituelle. Puis « Écrire un codex, puis supprimer » sur un autre geste : le fichier s'écrit, puis la question habituelle. Puis, codex à jour, un troisième geste : **aucune fenêtre**. Puis une modification, et un quatrième geste : « Mettre ton codex à jour avant de supprimer ? ». Vérifie toi-même que chaque chemin d'écran que tu écris existe (Cadre, Conception, Évaluations…) : la porte du premier lot nommait « Réglages › Trimestre » au lieu de « Cadre › Trimestre ».
8. **Retire le worktree `1014-codex-complet`** après avoir vérifié qu'il n'a rien de non commité.
9. **`RELAIS.md` et `OU-EN-EST-ON.md` à jour.** Suite : 2a-2, sur une consigne de Cowork.

## Ce que tu rends

À Grégoire, trois lignes : le numéro en ligne et l'heure constatée ; le résultat du verdict complet (instables compris) et le tableau des 36 en une phrase (combien corrigées) ; où est sa porte. Ce que tu as supposé, en une ligne.
