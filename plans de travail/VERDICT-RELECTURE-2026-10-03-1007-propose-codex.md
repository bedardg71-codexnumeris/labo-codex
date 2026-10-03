# Verdict de relecture – #1007, second lot (2a-1) : le codex proposé avant une suppression

> Écrit par Cowork le 3 octobre 2026 à 7 h 55 (Toronto, mesurée par `date`), sur `22de2db9` (branche locale `claude/1007-propose-codex`) et la demande `DEMANDE-RELECTURE-2026-10-03-1007-propose-codex.md`.
> Lu : le diff entier de `js/codex.js` ; les 36 points d'insertion du diff de `js/` ; les appelants des fonctions devenues `async` (grep). Non rejoué : les bancs (montage de Cowork sans navigateur).

## Verdict

**Vert sous une correction.** Le parcours commun est juste : une seule fonction, une clé inconnue ne supprime rien, « Mettre à jour, puis supprimer » passe par `_mettreAJourLeCodex` elle-même et ne rend `true` que si le fichier est écrit (les trois sorties `false` sont lues). Les gardes qui refusent passent avant la fenêtre. La coupe 2a-1 / 2a-2 est acceptée.

## La correction (issue 1, avant la release)

**Une lecture faite avant l'attente, réécrite après.** Avant ce lot, la plupart de ces portes lisaient, posaient un `confirm` synchrone (qui gèle la page), puis écrivaient. Désormais, entre la lecture et l'écriture, il y a une attente : la fenêtre, et surtout, sur « Mettre à jour, puis supprimer », la génération et l'écriture du codex, qui peuvent durer des minutes sur un gros codex. Pendant ce temps, la page vit : un enregistrement différé peut écrire la même clé, et la porte réécrit ensuite le tableau qu'elle avait lu avant.

- **Lu** : `supprimerEvaluation` (`js/liste-evaluations.js`) lit `evaluationsSauvegardees` en tête, attend la fenêtre, puis écrit `evaluations.filter(...)` tiré de cette lecture. Une écriture de la même clé pendant l'attente serait perdue sans un mot.
- **Lu** : `supprimerFicheCoursAvecGarde` (`js/cours.js`) calcule `plan` avant l'attente et écrit ensuite `r.garde` pour chaque référence.
- **Lu, sans défaut** : `supprimerEtudiantV2` relit par `modifierEtAnnoncer` ; `viderTouteCorbeille` et `proposerNettoyage` détruisent exprès la liste capturée à l'affichage (#556).

**Ce que je demande** : pour chacune des 36 portes, la même question : ce qui est écrit après l'attente vient-il d'une lecture faite avant ? Là où oui, relire après l'attente (ou recalculer le plan), sans changer les textes. Rends le tableau des 36, une ligne chacune (« relit », « relu après l'attente, corrigé », « liste capturée exprès »). Un essai de banc qui rougit sur l'ancien code : une écriture de `evaluationsSauvegardees` pendant que la fenêtre attend, puis « Supprimer sans mettre à jour » : l'écriture concurrente survit.

**Probabilité** : faible (inféré : il faudrait qu'un enregistrement différé de la même clé tombe pendant la fenêtre). **Coût** : une donnée perdue sans message. La règle 2 tranche : ce qui ne se reprend pas se corrige avant de livrer.

## Tranché par Cowork

- **Livrer 2a-1 seul**, sans attendre 2a-2 : 36 portes protégées dès maintenant valent mieux qu'un lot plus gros plus tard ; 2a-2 a un coût encore inconnu. Release **minor**.
- **Pousser les commits de documents de `main`** : oui (règle de relais).
- **Retirer le worktree `1014-codex-complet`** : oui, après avoir vérifié qu'il n'a rien de non commité (sa branche est fusionnée).
- `confirmerSuppressionEvaluationSidebar` (`js/evaluation.js:3011`) lit le résultat de `supprimerEvaluation` par un `setTimeout` qui partira désormais trop tôt ; porte morte, sans bouton (ta remesure) : issue 3, rien à faire.

## Les mots de Grégoire

Acceptés par Grégoire (« oui », 7 h 56) : les variantes du § 4 telles quelles ; les mots du § 5 **avec la retouche de Cowork** (le bouton du milieu, sans codex actif, dit « Supprimer sans codex ») ; la ligne des Nouvelles du § 7 telle quelle.
