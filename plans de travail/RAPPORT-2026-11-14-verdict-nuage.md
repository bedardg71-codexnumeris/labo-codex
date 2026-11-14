# Rapport — lot « le nuage juge le verdict » (14 novembre 2026)

**Branche** : `lot/verdict-nuage`, partie de `main` (`254affdf6`). **PR** : #25, non fusionnée (Cowork relit d'abord ; jamais par l'application GitHub).
**Décision de Grégoire (15 h 51)** : GitHub devient le juge du verdict complet, le Mac en complément. Elle revient sur celle du 10 oct.
**Fait** : le déclencheur, la liste Linux avec ses causes, le complément du Mac, le jugement à deux parts, les règles réécrites, les délais à l'échelle du runner.
**Reste** : mesurer le complément sur le Mac (non lancé dans ce lot, par consigne) ; confirmer sur d'autres passages que le nuage reste vert ; `lot/essai-novice-14-nov` doit prendre `main` après la fusion de ce lot avant d'être rejugée.
**Dernier verdict du nuage sur la branche** : **vert** sur `2c8cc7a3f` (run 43650508547, 33 min). Ce rapport est le seul commit posé après ; il ne touche rien d'observable, le verdict vaut pour lui (`jugeSur`).

## Le déclencheur

- Du téléphone : application GitHub ▸ le dépôt ▸ Actions ▸ Tests ▸ Run workflow ▸ choisir la branche du lot ▸ Run workflow. Le run s'appelle « Verdict du nuage — <branche> » ; son résumé dit le commit jugé et le verdict.
- Du terminal : `node scripts/verdict-nuage.mjs --lancer`, puis `--attendre`.
- Le champ `branche` du formulaire ne sert qu'à juger une référence qui ne porte pas ce workflow (une branche partie d'avant ce régime).
- Pas de verdict automatique sur la pull request : onze passages `pull_request` en 80 min sur une seule branche le 12 nov. ; chacun prendrait les 20 machines et annulerait le précédent. La pull request garde Vitest.

## La liste Linux (`scripts/playwright-baseline-linux.json`)

Reclassée sur sept passages complets de `main` (10 au 14 nov.), puis complétée par les passages du jour. **61 entrées** : 16 rouges constants, 45 intermittents. Par famille : géométrie ou rendu 24, non élucidé 19, minutage 17, API absente 1, plateforme 0. Les 35 entrées de la liste du 7 nov. jamais rouges sur les sept passages sont retirées. S'y ajoutent les 6 exclus de `tests/playwright.config.js` (inchangés).

**Réparé** : `codex-1011` (deux essais) et `planif-menu-vue` (deux essais) posent eux-mêmes la prémisse qu'ils présumaient du Mac ; verts au nuage depuis. `codex-1012`, réparé de même pour l'API, va plus loin et s'arrête parfois sur un clic que couvre une notification : classé intermittent, géométrie. `lot-j0-bis` (le vrai `navigator.share`) ne se conditionne pas sans cesser de juger : il reste dans la liste, famille « API absente », jugé par le complément.

**La règle** : une entrée sans cause rougit `sentinelle-verdict-nuage-2026-11-14` (A.a) et rend le verdict du nuage NON JUGÉ (`juger-rapport-playwright.mjs`).

## Le complément du Mac (`node scripts/complement-mac.mjs`)

67 essais (61 de la liste, 6 exclus). **Durée non mesurée** : aucune suite Playwright n'a été lancée sur le Mac dans ce lot. D'après la passe complète du Mac du 13 nov. (`9b2bea83`), ces 67 essais y pèsent 9,3 min et y sont tous verts. Le script dit sa durée et écrit la part `complement` du jeton.

## Les passages du jour (tous à 20 morceaux, 20 rapports sur 20)

| Run | Commit | Durée | Joués | Rouges | Hors liste | Verdict |
|---|---|---|---|---|---|---|
| 43641104331 | `be0d7bdf1` (`lot/essai-novice-14-nov`, par le champ `branche`) | 34 min | 1 665 | 33 | 7 | rouge |
| 43642642137 | `cc588d6aa` (ce lot) | 36 min | 1 652 | 30 | 4 | rouge |
| 43642783326 | `19e8dd0f5` (ce lot + un essai rouge exprès) | 47 min, file comprise | 1 653 | 34 | 5 | rouge, **l'essai voulu est nommé** |
| 43646117379 | `7a88938e4` (ce lot, 4 essais classés) | 31 min | 1 652 | 27 | 2 | rouge |
| 43647118579 | `53676a101` (le même + délais × 2,5) | 36 min | 1 652 | 24 | 0 | **vert** |
| 43650508547 | `2c8cc7a3f` (ce lot, sommet : délais × 2,5, 61 entrées) | 33 min | 1 652 | 30 | 0 | **vert** |

**Constat** : la liste seule ne tarit pas la source. Chaque passage a amené 2 à 4 intermittents hors liste, jamais les mêmes (11 distincts en quatre passages), presque tous sur un délai. Le runner joue la suite 2,64 fois plus lentement que le Mac ; les délais par défaut de Playwright y valent, en temps de Mac, 11 s par essai et 1,9 s par attente. Mis à l'échelle sous la variable de la CI seulement (× 2,5, `retries` inchangé), ils ont donné le premier verdict vert du nuage depuis sa création, puis un second sur le sommet du lot. **Deux passages sont un indice, pas une preuve**, et l'effet des délais ne se sépare pas de celui de la liste : le second vert compte 30 rouges, autant qu'avant l'échelle ; ce qui a changé, c'est qu'aucun n'est hors liste (15 des 45 intermittents ont rougi). Au sommet, le juge dit une entrée constante jouée verte (`materiel-aide-accompagnement`, l'aide « i ») : elle passe aux intermittentes au prochain lot qui touche la liste, pas ici, pour ne pas périmer le verdict.

## La comparaison avec le Mac sur `be0d7bdf1`

Le verdict du Mac existe : jeton vert rendu le 14 nov. à 17 h 00 par `verifier-playwright.mjs` (0 rouge, 0 au second essai, sur batterie). Il n'a pas gardé son rapport : la comparaison se fait donc sur les comptes, pas essai par essai.

- Verts au nuage : 1 632 (1 625 et 7 au second essai). Le Mac n'ayant aucun rouge, tous sont verts des deux côtés.
- Les 33 rouges du nuage, tous verts au Mac : 26 sont dans la liste du juge (18 constants, 8 intermittents) ; 5 sont les essais réparés dans ce lot, que cette branche ne porte pas ; **2 n'étaient pas dans la liste** (`parcours-5-monter-ton-cours`, « les sept étapes » et « capture 25 »). Les deux y sont maintenant, vus rouges aussi sur le code de ce lot.
- Les 6 exclus ne sont pas joués au nuage.

## Les break-tests

- Régime : un essai rouge exprès (`zz-break-test-verdict-nuage.spec.js`, branche jetable supprimée) ⮕ le verdict du nuage rougit et le nomme (run 43642783326).
- Sentinelle : une cause retirée du fichier réel ⮕ A.a rouge ; une seule part du jugement suffit ⮕ B.c rouge ; la marque « autre référence » non lue ⮕ D.b rouge ; le report qui ne s'arrête plus à un fichier observable ⮕ D.e rouge ; l'échelle des délais appliquée au Mac ⮕ F.a rouge. Chacun restauré, sentinelle verte (27 essais).

## Les textes de règles changés

`PROTOCOLE.md` : étape 5 de la chaîne, l'ordre (« commit → relecture croisée → corrections → push de la branche → verdict du nuage + complément du Mac → `main` avance, push »), la règle 7 (réécrite en entier), la règle 8 (titre et dernière phrase), l'interdit de fusion par l'application (« sans jugement (règle 7) »). `fin-de-session-labo-codex` §4.5 (réécrit), §4.6.1 et §4.6.2. `mesures-sous-condition.md` §2 et §2.1. `release-et-changelog`. `CLAUDE.md` (deux passages). `tests.yml` (point 12 du journal). Le diff fait foi : `git diff main...lot/verdict-nuage -- PROTOCOLE.md`.

## Ce que j'ai supposé

1. La cadence du 11 oct. (« un seul verdict le soir ») tombe avec son motif, le Mac immobilisé : la règle 7 dit maintenant un verdict par lot, sur sa branche. La décision de Grégoire nommait celle du 10 oct., pas celle du 11.
2. La règle 8 (Cowork fermé) s'applique au complément tant qu'il n'a pas été mesuré seul.
3. Pas de verdict automatique sur la pull request.
4. Le crochet pré-push reste permissif (il avertit) ; c'est `pousser.sh` qui refuse, sur `main`, un commit non jugé.
5. Les délais à l'échelle du runner entrent dans le lot sur la foi d'un seul passage.
6. Un commit qui ne touche rien d'observable garde le verdict de son ancêtre (le rapport, le relais).

## Ce que j'ai laissé

- Le complément du Mac n'a jamais tourné : sa première course est sa vraie épreuve.
- Le push sur `main` rejoue le verdict du nuage sur un commit déjà jugé (336 minutes de machines, gratuites) : dernier filet, gardé.
- Les documents figés (`CONSIGNE-DEMARRAGE-*.md`, `OU-EN-EST-ON.md`, `docs/securite/TESTS-AUTOMATISES.md`) parlent encore de l'ancien régime.
- `verifier-playwright.mjs` (la suite d'un bloc) reste, avec ses gardes : plus rien ne l'appelle d'office.
- Les 19 entrées « non élucidé » : lues, pas expliquées.
