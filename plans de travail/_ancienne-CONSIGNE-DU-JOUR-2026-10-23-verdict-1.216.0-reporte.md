# Consigne du jour – le verdict complet et la mise en ligne de la 1.216.0 (vendredi 23 octobre 2026)

> Écrite par Cowork le vendredi 23 octobre 2026 à 10 h 52 (Toronto, mesuré par `date`), sur `main` à `56f7be93` (release 1.216.0, non poussée). Elle remplace la consigne des Nouvelles et de la version (10 h 36), exécutée, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-23-nouvelles-et-version-1.216.md`. Relecture de Cowork : `VERDICT-RELECTURE-2026-10-23-version-1.216.0.md`, acceptée.
> **Quand Grégoire colle la ligne qui pointe ici, c'est son signal** : Chrome, Safari et Claude sont fermés, le Mac est branché (`PROTOCOLE.md`, règles 7 et 8). Le signal peut venir de jour : #1142 est un défaut urgent, et chaque bascule de copie en mode Évaluer sur la 1.215.0 en ligne peut encore écrire un mauvais compte dans une évaluation verrouillée.

## 0. Avant tout

Aucune suite ne tourne en arrière-plan ; sinon, attends-la (règle 5).

## 1. Le verdict complet

Sur `56f7be93`, selon `fin-de-session` § 4.5. **Rien ne se commite avant le verdict** : il juge ce commit-là. Ni la demande de relecture, ni la ligne du plan, ni ces docs de Cowork.

## 2. Vert

1. Push de `main`.
2. Un commit de docs, poussé seul ensuite : la demande de relecture de la 1.216.0 et la ligne de l'étape 2b du plan (restées hors commit), le verdict de Cowork, cette consigne et son archive, et les fichiers de relais qui constatent le push (`OU-EN-EST-ON.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, `RELAIS.md`). Fichiers nommés, un par un. Pas `.claude/worktrees/`.
3. Constate `origin/main` et la version servie par Netlify.
4. `CONSIGNE-DU-JOUR.md` à l'état neutre sur la 1.216.0.

## 3. Rouge

**Ne pas pousser, ne rien corriger** : personne ne pourrait relire. Écris dans `RELAIS.md` (bloc de tête, non poussé) et dans le rapport : chaque spec rouge, sa première ligne d'erreur, et ton diagnostic (régression de la palette, de #1142, spec fragile, ou autre). Cowork le lit à la reprise.

## 4. Clôture

Termine par **le geste à vérifier à l'écran**, après le push, celui de la demande de relecture : les Nouvelles 1.216 en tête ; un bloc de la palette qui se pose au curseur dans un critère algorithmique ; en mode Évaluer, chaque copie qui garde son nombre d'erreurs après un aller-retour. Puis la phrase qui dit à Grégoire de lancer `await ComptesErreurs.verifier()` dans la console de Chrome, où sont ses vraies données, et de rapporter la liste à Cowork avant toute réparation.
