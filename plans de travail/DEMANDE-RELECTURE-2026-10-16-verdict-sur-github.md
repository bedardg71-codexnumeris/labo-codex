# Demande de relecture – la vérification complète rendue à GitHub

> Claude Code, 16 octobre 2026, 16 h 50 (Toronto). Consigne : `CONSIGNE-2026-10-16-verdict-sur-github.md`. Pour Cowork (`PROTOCOLE.md`, règle 2).
> **Rien n'est poussé sur `main`.** Le lot vit sur la branche `ci/verdict-morceaux-2` (poussée pour que GitHub puisse l'exécuter). Il ira sur `main` après ta relecture, par fusion d'`origin/main`.

## En une phrase

Playwright tourne maintenant sur GitHub en 16 morceaux parallèles, en **22 min de bout en bout**, à la demande et sur un push qui touche un chemin observable. Un job final juge l'ensemble contre la baseline, comme le Mac. Mais la suite est **rouge sur Linux : 18 essais à chaque fois**, plus 1 à 3 qui varient d'un run à l'autre. Personne ne les a encore départagés.

## Les mesures (mandat, point 1)

| Run | Forme | Résultat |
|---|---|---|
| 38946931144 (`main`, `eb6dd86e`, workflow inchangé) | un seul job | **Coupé à 60 min** après ~200 essais sur 784 ; 8 rouges parmi eux |
| 38949548776 (branche) | 4 morceaux, plafond 30 min | 3 morceaux coupés ; le verdict dit « 1 rapport sur 4 — NON JUGÉ » et rougit |
| 38953736186 (branche) | 10 morceaux | 10 rapports sur 10, **784 essais joués en 31 min** de bout en bout ; morceaux de 9,3 à 28,8 min |
| 38957826759 (branche) | 16 morceaux par `--shard` | 15 morceaux finissent entre 3 et 22 min ; le 4e est coupé à 30 min (NON JUGÉ). `--shard` découpe des tranches contiguës, et les `codex-*`, qui coûtent 40 à 100 s par essai ici, y tombent toutes ensemble. |
| **38962236596** (branche, `HEAD` du lot) | **16 morceaux, fichiers distribués en alternance** | **16 rapports sur 16, 784 essais joués, morceaux de 6,2 à 20,8 min, 22 min de bout en bout.** Verdict ROUGE : 19 rouges absentes de la baseline. |

- **Machine** : 4 processeurs et 15 Go, mesurés par `nproc` et `free` dans chaque morceau. La source du billet de GitHub est donc confirmée.
- **Rythme** : 176 min de suite cumulées sur 10 morceaux, soit ~13,5 s par essai. Le Mac fait la suite en ~45 min. Le runner est environ **quatre fois plus lent** par essai, à un seul worker.
- **`EXCLUS_WEBKIT_LINUX`** : 6 essais (5 specs), toujours exclus et toujours annoncés dans le nom de l'étape. Ils ne sont pas joués : on ne sait pas s'ils seraient verts sur cette machine.

## Ce que le lot change

| Fichier | Changement |
|---|---|
| `.github/workflows/tests.yml` | Quatre jobs au lieu de deux. Journal, point 9. |
| `scripts/rapport-playwright.mjs` (nouveau) | Les règles du jugement en fonctions pures : identité d'une spec, échecs, rattrapées au second essai, comparaison à la baseline. |
| `scripts/juger-rapport-playwright.mjs` (nouveau) | Le juge de la CI : il lit le rapport fusionné et sort en 0, 1 ou 2, comme le Mac. Il écrit son verdict dans le résumé du run, celui que montre l'application du téléphone. |
| `scripts/morceau-playwright.mjs` (nouveau) | Les fichiers d'un morceau, distribués en alternance (le i-ème fichier trié va au morceau i mod n). Les filtres sont ancrés. Les 16 morceaux couvrent exactement les 790 essais de la suite locale : aucun doublon, aucun oubli. |
| `scripts/verifier-playwright.mjs` | Il **importe** ces règles au lieu d'en porter une copie. Son comportement ne change pas. |
| `tests/unit/sentinelle-ci-verdict-morceaux.test.js` (nouveau) | 13 essais : les règles, la répartition et le juge. |
| `tests/unit/sentinelle-ci-paths-ignore.test.js` | Le bloc 2 est réécrit pour la nouvelle forme. Il contient un banc git jetable qui exécute le vrai script de décision sur cinq cas. |
| `tests/unit/sentinelle-533-…` | G.c lit la règle `spec.ok === false` là où elle vit maintenant. |
| `BACKLOG.md` | #1090 : la PR Dependabot de Vitest, inscrite sans agir (mandat). |

Les quatre jobs :

1. `vitest` : inchangé.
2. `decision` : à la demande, il répond oui ; sur un push, seulement si `scripts/lot-observable.sh` (la règle du crochet) voit un chemin observable ; dans le doute, il répond oui. Il est sauté sur une pull request. Il porte le nombre de morceaux, en un seul endroit.
3. `playwright` : les morceaux. Chacun joue ses fichiers et dépose un rapport blob. Il **ne juge pas** : un essai rouge ne le fait pas rougir.
4. `verdict` : il compte les rapports (un rapport manquant donne NON JUGÉ, et le job rougit), les fusionne, puis juge contre `scripts/playwright-baseline.json`.

**Non touchés**, comme demandé : le crochet pré-push, `pousser.sh` et le verdict du soir. Rien dans `js/` ni dans `index.html`. `workers: 1` reste dans chaque morceau : le parallélisme vient des machines.

## Vérifié comment

- Vitest dans un worktree propre (sans le travail de l'autre session) : 764 fichiers sur 764, **8 936 essais sur 8 936**.
- Break-tests, chacun rouge puis remis :
  - retirer la garde « aucun essai joué » du juge ;
  - faire compter les essais individuels au lieu de `spec.ok` ;
  - ajouter `pull_request` au `if:` de `decision` ;
  - forcer `juger=non` sur le push ;
  - retirer `needs.playwright.result != 'skipped'` du verdict ;
  - répartir en tranches contiguës au lieu de l'alternance.
- Sur GitHub, chaque chemin du verdict a été vu : NON JUGÉ (run à 4 morceaux), puis ROUGE avec la liste nommée (run à 10).
- Fusion locale de deux morceaux : les identités sortent sous la même forme que sur le Mac (`setup.spec.js › …`). La baseline reste donc commune.

## Incident pendant la session – à lire

Le banc git du cliquet a d'abord hérité de `GIT_DIR` quand le crochet pré-push lançait Vitest. Résultat : `git init` a écrit `core.bare = true` dans le `.git/config` du dépôt principal, et trois commits parasites sont arrivés sur ma première branche locale `ci/verdict-morceaux`. **Rien n'a été poussé** : le crochet a bloqué ce push.

- **Réparé** : `core.bare` est remis à `false`. Le `git status` du checkout principal montre le travail de l'autre session intact, et je l'ai prévenue.
- **Corrigé à la source** : le banc purge les variables `GIT_*`, comme le fait déjà la sentinelle anti-cache. Il s'arrête aussi s'il ne se trouve pas dans son dépôt jetable. Contre-épreuve faite : avec un `GIT_DIR` piégé vers un dépôt leurre, le leurre reste intact.
- **Reste à faire, par Grégoire** (un `reset --hard` m'a été refusé, à raison) : supprimer la branche locale `ci/verdict-morceaux` et son worktree `.claude/worktrees/verdict-morceaux`. Ils ne contiennent que les commits parasites et une copie de mon lot.

## Ce que j'ai supposé – à vérifier

1. **Pas de Playwright sur les pull requests.** La consigne nomme le push et la demande. Les PR de Dependabot gardent Vitest seul.
2. **16 morceaux** : c'est mesuré (le plus long fait 20,8 min). Plus de morceaux raccourciraient l'attente sans rien coûter, mais le compte gratuit plafonne à 20 jobs simultanés.
3. **Le plafond de 30 min par morceau** : au-delà, un morceau coupé donne NON JUGÉ, jamais vert.

## Ce qui reste ouvert

- **Les rouges sur Linux** : 18 en commun entre les runs à 10 et à 16 morceaux. S'y ajoutent, d'un run à l'autre, deux #1007, le témoin à 360 px sombre ou #868 : instables, ou dépendants de l'ordre. Elles se groupent en familles : codex et suppression (#1007, #1011, #1012, #991), export de travaux (#895), ouverture de codex (lot I bis), partage (lot J0 bis), nettoyage (#892), planificateur (#963, #929, menu Vue), témoin à 360 px sombre. Inférence, pas mesure : beaucoup touchent des fenêtres de fichier, l'espace de stockage ou le glisser-déposer, qui dépendent de la plateforme. **Le verdict du Mac de ce soir les départage.** Une rouge sur le Mac est une régression. Une verte sur le Mac va en exclusion ou en correctif ; c'est un lot à part, puisque le cliquet verrouille la liste à 6.
- **Mandat, point 5** (la comparaison du soir) : une fois le lot sur `main`, le verdict du Mac et `gh workflow run tests.yml` tourneront sur le même commit. Je rapporterai les durées et les deux listes de rouges, avec une recommandation.
