# Mesure – le stock du défaut « Nombre d'erreurs » (#1121)

> Cowork, mardi 20 octobre 2026, 9 h 37 (Toronto, mesuré par `date`), avec l'accord de Grégoire (9 h 34). **Lecture seule** : rien n'a été écrit. Mesuré dans son Chrome, sur `app.codexnumeris.org`, trimestre actif `a2026` (pas en démonstration). Aucun nom ni DA d'élève n'a été lu ni n'est consigné ici. À commiter avec le prochain commit de Claude Code.

## La question

Le correctif `84d76712` tarit la source : palette Codes fermée, le champ « Nombre d'erreurs » suit de nouveau les codes. Reste le stock : des évaluations de l'automne 2026 enregistrées palette fermée ont-elles gardé 0 erreur alors que la copie porte des codes ?

## La méthode

Pour chaque évaluation de `a2026_evaluationsSauvegardees` qui porte un critère algorithmique : le nombre d'erreurs enregistré (`donneesAlgorithmiques[critereId].erreurs`) comparé au nombre de codes `errfr_*` posés dans l'annotation de sa copie, par le chemin de `scripts/reparation-donnees-algorithmiques.js` (lu sous la clé du trimestre, #671), sans son mode d'écriture.

## Le résultat

- 108 évaluations au trimestre ; 9 grilles lues sous la clé du trimestre ; 28 évaluations portent un critère algorithmique, toutes dans « Portrait de lecteur » (deux productions).
- **26 cohérentes** : le nombre enregistré égale le nombre de codes. Ce compte non nul est le témoin que la mesure a bien lu les copies.
- **0** évaluation enregistrée à 0 erreur alors que sa copie porte des codes ; **0** autre écart.
- **2** évaluations sans annotation enregistrée : la comparaison ne peut pas les juger.

## Disposition

Stock **vide** dans ce qui se mesure : rien à réparer. Grégoire a dit (9 h 34) n'avoir évalué qu'une copie de la production rentrée ce matin, celle où il a vu le défaut ; elle n'apparaît pas parmi les écarts.
