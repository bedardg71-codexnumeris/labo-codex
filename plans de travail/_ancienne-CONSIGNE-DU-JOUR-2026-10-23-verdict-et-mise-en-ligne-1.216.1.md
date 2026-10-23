# Consigne du jour – le verdict complet et la mise en ligne de la 1.216.1 (vendredi 23 octobre 2026)

> Écrite par Cowork le vendredi 23 octobre 2026 à 14 h 57 (Toronto, mesuré par `date`), sur `main` à `aaaa80b5` (release 1.216.1, non poussée ; en ligne : la 1.215.0). Elle remplace la consigne de 13 h 59, exécutée, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-23-nouvelles-1.216.1.md`. Relecture de Cowork : `VERDICT-RELECTURE-2026-10-23-version-1.216.1.md`, acceptée.
> **Quand Grégoire colle la ligne qui pointe ici, c'est son signal** : Chrome, Safari et Claude sont fermés, le Mac est branché (`PROTOCOLE.md`, règles 7 et 8). Le signal peut venir de jour : #1142 est un défaut urgent.

## 0. Avant tout

Aucune suite ne tourne en arrière-plan ; sinon, attends-la (règle 5).

## 1. Le verdict complet

Sur `aaaa80b5`, selon `fin-de-session` § 4.5. **Rien ne se commite avant le verdict** : il juge ce commit-là. Ni la demande de relecture, ni le verdict de Cowork, ni cette consigne.

## 2. Vert

1. Push de `main`.
2. Un commit de docs, poussé seul ensuite, fichiers nommés un par un : la demande de relecture de la 1.216.1, le verdict de Cowork, cette consigne et son archive, et les fichiers de relais qui constatent le push (`OU-EN-EST-ON.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, `RELAIS.md`). Pas `.claude/worktrees/`.
3. Constate `origin/main` et la version servie par Netlify (1.216.1, build `1023-1402`).
4. `CONSIGNE-DU-JOUR.md` à l'état neutre sur la 1.216.1.

## 3. Rouge

**Ne pas pousser, ne rien corriger** : personne ne pourrait relire. Écris dans `RELAIS.md` (bloc de tête, non poussé) et dans le rapport : chaque spec rouge, sa première ligne d'erreur, et ton diagnostic (régression de la palette, de #1142, de #1144, spec fragile, ou autre). Cowork le lit à la reprise.

## 4. Clôture

Termine par le geste à vérifier à l'écran de ton rapport de 14 h 04 (les quatre points), puis par les deux commandes de console à lancer dans Chrome, où sont les vraies données de Grégoire : `await ComptesErreurs.verifier()` et `await CartouchesDecalees.verifier()`. Aucune réparation sans que Grégoire ait montré les listes à Cowork.
