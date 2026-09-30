# Consigne – lot H : la vérification avant l'envoi dure une heure au lieu de 15 minutes (#987)

> Écrite le 29 septembre 2026, à 15 h 10 (Toronto), par Cowork, sur accord de Grégoire (« oui », vers 15 h 05). L'ancienne consigne (lot G) est archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-29-lot-G-codex-ipad.md`.
> **Condition de départ** : `git --no-optional-locks log --oneline -1 origin/main` montre `69c7d523` ou plus récent. Branche `lot-h-duree-suite`, partie de `main`.
> **Priorité** : bloque un chantier, la livraison (motif d'entrée de #987). Chaque lot qui suit paie cette heure. Rien n'est visible à l'écran de l'application.

## 1 · Ce qu'on sait (lu dans la fiche #987 du BACKLOG, pas remesuré par Cowork)

- Deux verdicts de suite le 29 sept. sur 1.168.0 (`27fa681d`) : environ 85 fichiers sur 191 en 40 minutes, soit environ une heure pour la suite. `scripts/pousser.sh` annonce « ~15 min » (l. 125 ; l. 60 en commentaire).
- Le premier verdict a rougi par délai dépassé sur un banc qui passe seul en 7,8 s par essai ; le second a fini vert avec quatre essais repris au second passage (`retries: 1`).
- `tests/playwright.config.js` impose `workers: 1` (l. 56) : toutes les specs partagent le `localStorage` de l'origine `file://`. La suite est donc strictement séquentielle. 192 fichiers `tests/integration/*.spec.js` aujourd'hui.
- Inconnu : si la lenteur est récente, ou si la suite a grossi sans que l'estimation suive.
- Contexte machine (dit par Grégoire, 12 sept.) : le Mac a 16 Go ; trois redémarrages nocturnes par pression mémoire extrême, coïncidant avec des verdicts Playwright lancés pendant que Cowork (VM d'environ 2,9 Go) et Safari tournaient.

## 2 · Le mandat : mesurer d'abord, puis corriger la cause

**2.1 Mesurer, avec la commande et son témoin.** Le but est de départager quatre hypothèses, sans les supposer :
- (a) la suite a grossi : nombre de fichiers et d'essais aujourd'hui, et au moment où « ~15 min » a été écrit (`git log -S'15 min' -- scripts/pousser.sh` donne `81ae1e03`, 19 sept., à vérifier) ;
- (b) un petit nombre de specs coûte l'essentiel : durée par fichier (reporter JSON de Playwright), les vingt plus lentes, et la part de la durée qui vient des reprises (`retries`) et des attentes fixes (`waitForTimeout`, délais longs) ;
- (c) la machine : durée d'une même tranche de specs, Mac au repos (Cowork fermé, Safari fermé) contre Mac chargé ;
- (d) une régression récente : la même tranche des specs les plus lentes sur 1.167.0 (`053d96cb`) et sur `main`, par un worktree, même machine, même état.

Tu choisis l'ordre et la forme des mesures pour que la machine tourne le moins longtemps possible : une suite complète avec le reporter JSON, puis des tranches ciblées, vaut mieux que deux suites complètes à l'aveugle. **Avant chaque passage long, dis-le à Grégoire dans la conversation et demande-lui de fermer Cowork** (la pression mémoire de son Mac, cf. § 1) ; ne lance rien de long sans sa réponse.

**2.2 Corriger la cause mesurée.** Le technique se tranche seul, en le disant en une ligne : une attente fixe remplacée par une attente d'état, une spec qui recharge l'application plus que nécessaire, l'estimation de `pousser.sh` remise au vrai chiffre, une façon d'isoler les specs qui permettrait plus d'un worker (origines distinctes, par exemple), si la mesure montre qu'elle tient. Dans tous les cas, l'estimation affichée par `pousser.sh` dit la durée mesurée.

**Remonte à Grégoire, et attends, seulement pour :**
- tout ce qui coûte des minutes GitHub ou change quand la suite tourne (règle 7 de `PROTOCOLE.md` ; les shards restent écartés, sa décision du 4 sept.) ;
- retirer, sauter ou affaiblir un test : une couverture perdue n'est pas un gain de temps, c'est une autre décision.

**Trouvailles** : les trois issues de `CLAUDE.md`. Les passages planifiés de GitHub en échec (#979) et le script qui juge la mauvaise branche (#980) sont voisins, **hors lot** sauf si la mesure montre qu'ils partagent la cause.

## 3 · Ce qui est dû à la fin

- `plans de travail/RAPPORT-2026-09-29-987-duree-suite.md` : chaque hypothèse avec sa mesure (commande + témoin) et son verdict (confirmée, écartée, non départagée) ; la durée avant et après correction, mesurée dans le même état de la machine.
- Commit sur la branche, puis `plans de travail/DEMANDE-RELECTURE-…-lot-H-duree-suite.md` pour Cowork. Ni release ni push avant sa relecture (ordre de `fin-de-session` § 4.5). Si seuls des tests et `pousser.sh` changent, dis si une version est due.
- Pour Grégoire, en une ou deux phrases de français d'utilisateur : combien de temps prend maintenant la vérification avant l'envoi, et pourquoi elle en prenait une heure.
