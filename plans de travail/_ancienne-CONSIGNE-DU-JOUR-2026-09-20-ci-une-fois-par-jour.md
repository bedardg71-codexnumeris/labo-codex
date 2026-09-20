# Consigne en attente – la suite complète au navigateur tourne UNE FOIS PAR JOUR sur GitHub, plus à chaque push

> Écrite le 20 septembre 2026, 16 h 34 (Toronto), par Cowork. **Décision de Grégoire, 20 sept. en fin d'après-midi** : garder la suite ENTIÈRE (elle seule voit les régressions), mais cesser de la payer à chaque push, puisque son Mac la fait déjà tourner en entier avant chaque push par `scripts/pousser.sh`. Sa question, mot pour mot : « est-il nécessaire de faire les tests Playwright sur toute l'application ? »  Réponse retenue : oui pour l'étendue, non pour la fréquence.
> **En attente** : ce lot part le premier, AVANT `CONSIGNE-EN-ATTENTE-878-nommer-les-pages.md` — il change ce que chaque push suivant coûte. Au départ : archive `CONSIGNE-DU-JOUR.md` (plafond 60 min, exécutée) sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-20-plafond-github.md`, puis renomme ce fichier en `CONSIGNE-DU-JOUR.md`.
> **Condition de départ** : le commit du plafond (`74a845f0` ou son équivalent) est sur `origin/main`, et son run est LU. Aucune autre session n'écrit dans `.github/` ni dans `tests/`.
> ⛔ Rien dans `js/` : aucune release, rien à l'écran pour Grégoire.

---

## 1 · Ce qui change, et ce qui ne change pas

- **Ne change pas** : la suite reste ENTIÈRE. On ne juge jamais « seulement la dernière correction » — c'est précisément ce qui laisserait passer une régression ailleurs. Le `vitest` du hook et le **verdict WebKit complet du Mac avant chaque push** tiennent tels quels : rien n'est poussé sans avoir été jugé.
- **Change** : sur GitHub, le job `playwright` ne part plus à chaque push. Il part **une fois par jour**, sur `main`, et à la demande.

## 2 · Ce qui est attendu

1. **Déclencheurs du job `playwright`** : `schedule` (une fois par jour) et `workflow_dispatch` (l. 163, déjà présent). Le job quitte la voie du `push`. Le job `vitest` garde le `push` et la `pull_request` tels quels.
2. **Heure** : `cron: '0 8 * * *'` (UTC) = 4 h du matin à Toronto, pour que le verdict soit là quand Grégoire ouvre sa journée. ⚠ Le cron de GitHub est en UTC et ne suit pas l'heure avancée : l'écart de novembre est connu et assumé, à dire en commentaire.
3. **Garde d'inutilité** : si `main` n'a pas bougé depuis le dernier run planifié, le job s'arrête AVANT d'installer WebKit (mesure : `git log -1 --format=%cI main` contre 24 h, ou le SHA du dernier run planifié via `gh`). Motif : un run quotidien sur un dépôt immobile paierait 40 minutes pour rien — le défaut même qu'on corrige.
4. **La liste `OBSERVABLE` et sa décision** (§ du job `vitest`) : elle ne sert plus à lancer `playwright` sur un push. **MESURE D'ABORD** ce qui la lit encore (le cliquet `tests/unit/sentinelle-ci-paths-ignore.test.js`, l. 159 fige `if: needs.vitest.outputs.playwright == 'oui'`), puis retire-la ou garde-la, et dis lequel et pourquoi. ⛔ Ne laisse pas une sortie que plus personne ne lit sans le dire.
5. **Le cliquet** : réécris-le pour la nouvelle forme, en gardant son intention (le workflow ne peut pas dériver en silence) ; une mutation qui remettrait `playwright` sur le `push` doit le faire rougir.
6. **Le rituel de début de session** (`.claude/skills/debut-de-session-labo-codex/SKILL.md`, §2.1) : il lit les JOBS d'un run et distingue jugé-vert / jugé-rouge / non jugé. Il doit maintenant dire que **le verdict au navigateur ne vient plus du run du push, mais du dernier run planifié**, avec son SHA — et qu'un écart entre ce SHA et `HEAD` est normal, pas un défaut. Ajoute la ligne au tableau d'historique du fichier.

## 3 · Arrêts

- Si la garde du point 3 ne peut pas se mesurer sans jeton supplémentaire ou sans droit particulier : pose le `schedule` sans garde, dis-le, et propose la mesure à Grégoire plutôt que d'inventer un contournement.
- ⛔ Ne réduis PAS le nombre de specs, n'ajoute pas de shards (écartés), ne touche pas aux exclusions Linux.

## 4 · Preuve

- Le cliquet réécrit rougit sur trois mutations : `playwright` remis sur le `push`, le `cron` retiré, la garde d'inutilité retirée.
- Le premier run planifié conclut et est LU : durée, SHA, verdict, inscrits au relais.
- Un `workflow_dispatch` lancé à la main conclut aussi : c'est la porte de sortie quand on veut un verdict tout de suite.
- **Ce que Grégoire y gagne, à écrire en une ligne dans le relais** : le nombre de runs complets par jour, avant et après (aujourd'hui : cinq pushs de code, donc cinq runs).
