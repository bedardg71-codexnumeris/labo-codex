# Rapport – lot H : la vérification avant l'envoi dure une heure (#987)

> Écrit le 29 sept. 2026, vers 18 h (Toronto), par Claude Code. Répond à `plans de travail/CONSIGNE-DU-JOUR.md` (lot H). Branche `lot-h-duree-suite`, partie de `main` (`69c7d523`, 1.169.1).

## En bref

**Le Mac s'endormait pendant la suite.** Sur un passage complet, 75 des 115 minutes tombaient dans 13 essais qui avaient chacun commencé à l'instant exact d'une mise en veille. Ces 13 essais portaient aussi les 2 échecs et les 10 reprises du passage. **Le temps réellement actif était de 40 minutes, pas de 15** : la suite a doublé depuis le 19 sept., et ses nouveaux fichiers sont trois fois plus lourds par essai.

**Corrigé** : `verifier-playwright.mjs` tient le Mac éveillé (`caffeinate`) le temps du verdict. **Après la correction : 42,8 minutes, 0 échec, 4 reprises (18 s au total), aucune veille.** L'estimation affichée passe à « ~45 min ».

## 1 · Les deux passages mesurés

Les deux passages ont été faits dans le même état : Mac au repos (Cowork et Safari fermés, confirmé par Grégoire), sur la branche, où le code est identique à `69c7d523`. La commande :

`cd tests && PLAYWRIGHT_JSON_OUTPUT_NAME=<rapport> npx playwright test --reporter=json,line`

Chaque passage était accompagné d'un relevé `sysctl vm.loadavg` et `memory_pressure` par minute.

| | Avant (15 h 17) | Après, sous `caffeinate -i` (17 h 15) |
|---|---|---|
| Durée au mur | **115,7 min** | **42,8 min** |
| Essais | 619 pour 607 tests | 611 pour 607 tests |
| Échecs / repris | **2 / 10** | **0 / 4** |
| Temps en reprises | 8,5 min | 0,3 min |
| Essais de plus de 60 s | 13, soit 75,1 min | 0 (le plus long : 90 s, repris) |
| Veilles (`pmset -g log`) | 16 entrées « Entering Sleep » | aucune |
| Charge maximale (relevé par minute) | 19,17, une fois, au réveil de 16 h 13 ; sinon < 6 | 5,72 |

## 2 · Les hypothèses

**(a) La suite a grossi : confirmée, et c'est la cause du « 40 au lieu de 15 ».** La commande `git ls-tree` confirme que `81ae1e03` (19 sept.) est bien le commit qui a écrit « ~15 min ». Ce jour-là, la suite comptait 135 fichiers et environ 300 tests ; aujourd'hui, 192 fichiers et 607 tests. En durées mesurées au premier passage, hors veille et hors reprises :

| Fichiers | Nombre | Essais | Durée | Par essai |
|---|---|---|---|---|
| Déjà là le 19 sept. | 134 | 375 | 14,5 min | 2,3 s |
| Ajoutés du 19 sept. à la 1.167.0 | 50 | 207 | 21,5 min | 6,3 s |
| Ajoutés depuis la 1.167.0 | 6 | 14 | 3,1 min | 13,2 s |

Les fichiers du 19 sept. coûtent toujours le « ~15 min » annoncé à l'époque.

**(b) Quelques specs coûtent l'essentiel : écartée.** Hors veille, les 10 fichiers les plus lents font 40 % du temps et les 20 plus lents 56 %. Le plus lent (`evaluation-961-…`) pèse 3,3 min. Les attentes fixes inscrites en dur totalisent au moins 6,5 min : 472 appels `waitForTimeout`, dont 99 d'une seconde ou plus, lecture statique qui ne compte pas les boucles. C'est un gain possible, pas la cause de l'heure.

**(c) La machine : confirmée, sous la forme de la veille, pas de la pression mémoire.** Réglage `pmset -g` : `sleep 1`, c'est-à-dire veille après une minute sans activité. Aucun `caffeinate` n'existait dans `scripts/`. Au premier passage, le relevé par minute a six trous (15 h 27 → 15 h 32, 15 h 32 → 15 h 52, 15 h 53 → 16 h 01, 16 h 01 → 16 h 13, 16 h 32 → 16 h 45, 16 h 45 → 16 h 57). Les 13 essais de plus de 60 s commencent chacun à l'heure d'une entrée « Entering Sleep state » du journal : 15 h 28, 16 h 01, 16 h 03, 16 h 10, 16 h 32, 16 h 36, 16 h 39, 16 h 47, 16 h 58, entre autres. Le délai d'un essai continue de courir pendant la veille : un banc de 7 s rend « timedOut » en 1 008 s. **Inférence** : c'est ce qu'avait vécu le verdict du 29 sept. qui a rougi « sur un banc qui passe seul en 7,8 s ». La charge (Mac chargé contre Mac au repos) n'a pas été mesurée à part : la veille suffit à expliquer l'écart.

**(d) Une régression récente : écartée pour les specs existantes.** Les 134 fichiers du 19 sept. tiennent en 14,5 min, soit le chiffre annoncé à l'époque. La tranche comparée sur 1.167.0 dans un worktree n'a pas été lancée : la mesure ci-dessus répond à la question sans faire tourner la machine une heure de plus.

## 3 · Ce qui change

- `scripts/verifier-playwright.mjs` lance `caffeinate -i -w <pid>` (macOS seulement) avant la suite : tous les appelants sont couverts (pousser.sh, fin-de-session, lancement à la main). Éprouvé : `pmset -g assertions` montre « PreventUserIdleSystemSleep 1, on behalf of Process ID … », et `caffeinate` disparaît avec son processus. Son message passe de « ~4 min » (périmé) à « ~45 min ».
- `scripts/pousser.sh` : « ~15 min » devient « ~45 min », aux lignes 60 et 125.
- `tests/unit/sentinelle-987-veille-pendant-la-suite.test.js` : 3 essais, verts, qui vérifient que l'appel existe, qu'il est placé avant la suite, qu'il porte `-i -w pid` et qu'il n'est ni commenté ni neutralisé. 4 mutations, 4 rouges (retirer l'appel, retirer `-i`, le commenter, rendre la condition fausse), fichier restauré par copie, empreinte identique.
- **Source ou stock** : sans objet, aucune donnée d'utilisateur n'est touchée.

## 4 · Trouvailles

- **La CI GitHub, annulée chaque jour à 60 min** (audit de début de session : du 24 au 29 sept., `timeout-minutes: 60`, `.github/workflows/tests.yml` l. 319). Un serveur ne s'endort pas, donc là-bas c'est la croissance de la suite (a) : 43 min sur le Mac dépassent 60 min sur le serveur Linux. Elle partage la cause, mais la corriger coûte des minutes GitHub : **remonte à Grégoire** (règle 7 de `PROTOCOLE.md`). Rien n'est changé.
- **Quatre reprises hors veille** au second passage : `grille-critere-ajoute-enregistrer-957`, `lot-C-echelles-chevrons-corbeille`, `palette-barre-boutons-clic-644`, `portes-relais-cadre` (#374). Délai dépassé au premier essai, vert au second. **Issue 3, commenté et oublié** : le verdict les affiche déjà comme instables, sans symptôme vécu.
- **Attentes fixes (au moins 6,5 min)** : **issue 2 non retenue**, non inscrite. Pas de symptôme vécu une fois la veille réglée ; c'est une optimisation, pas une cause.

## 5 · Version

Seuls des scripts et un test changent : rien de visible à l'écran, rien à dire aux testeurs. **Aucune version n'est due.** Le commit peut entrer dans `main` sans release.
