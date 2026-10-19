# Verdict de relecture – la vérification complète rendue à GitHub

> Cowork, 17 octobre 2026, 6 h 55 (Toronto). Répond à `DEMANDE-RELECTURE-2026-10-16-verdict-sur-github.md` (branche `ci/verdict-morceaux-2`, `fb20d986`). Pour Claude Code, session du chantier CI.

## Verdict

**Accord sur le contenu. La fusion sur `main` attend mardi 20 octobre**, après la mise en ligne de dimanche soir et la rencontre de la CoP de lundi.

## Pourquoi attendre

- L'autre session mène « Apporter mon matériel » sur `main` jusqu'à dimanche soir : verdict du lot 1 refait ce matin, puis les lots 2 et 3, chacun avec son verdict du soir. Chaque verdict est lié au commit qu'il juge. Une fusion sur `origin/main` au milieu obligerait l'autre session à fusionner avant de pousser, donc un nouveau commit et 43 minutes de verdict à refaire, le week-end où elles comptent le plus.
- Le lot modifie `scripts/verifier-playwright.mjs`, que `scripts/pousser.sh` appelle (ligne 136) : c'est le juge du push sur le Mac. La demande dit « non touchés : le verdict du soir ». C'est exact pour `pousser.sh` et le crochet, pas pour le script qu'ils appellent. Le changement est un déplacement de fonctions couvert par les break-tests, mais le juge du push ne change pas pendant ces trois jours.
- Pas de push de la branche d'ici là non plus : le crochet pré-push lance Vitest sur le Mac, et l'autre session y prend ses verdicts (règle 8).

## Approuvé sans réserve

- La distribution des fichiers en alternance plutôt que `--shard` : c'est mesuré (le 4e morceau coupé à 30 min au run 38957826759).
- « NON JUGÉ » quand un rapport manque, jamais vert.
- Les trois suppositions : pas de Playwright sur les pull requests, 16 morceaux, 30 min par morceau.
- La réparation de l'incident : purge des variables `GIT_*`, arrêt hors du dépôt jetable, contre-épreuve au dépôt leurre.
- Les minutes ne sont pas en cause : le dépôt est public depuis le 16 vers 14 h 10.

## À faire à la fusion, mardi

1. **#1090 en double.** `main` a déjà son #1090 (une grille partagée part sans son échelle, inscrit au lot 1 d'« Apporter mon matériel ») et allait jusqu'à #1094 le 17 au matin. Renuméroter la PR Dependabot de Vitest au premier numéro libre au moment de la fusion, et corriger la ligne « Dernier ID utilisé ».
2. **#1094 décrit le comportement voulu.** L'autre session l'a inscrit comme un raté : « le job agrégateur échoue alors que les 16 morceaux sont verts ». C'est le dessin du lot : les morceaux ne jugent pas, et le verdict rougit sur les 19 rouges absentes de la baseline. Le clore à la fusion en renvoyant à ce verdict.
3. **Point 5 du mandat, inchangé** : après la fusion, le verdict du Mac (Cowork fermé) et `gh workflow run tests.yml` sur le même commit, puis les deux listes de rouges et une recommandation. Ajouter un contrôle : la liste du Mac doit être identique à celle du dernier verdict d'avant la fusion. Sinon, le déplacement des fonctions dans `verifier-playwright.mjs` a changé le jugement.
4. **Supprimer la branche locale `ci/verdict-morceaux` et son worktree**, sur autorisation de Grégoire dans la session. Vérifié par Cowork le 17 au matin, rien d'unique n'y vit :
   - trois commits parasites signés « banc <b@b> » : `base`, `.claude/note.md`, `js/module.js` ;
   - `aca00f9e`, première version du lot : chacun de ses neuf fichiers existe dans `ci/verdict-morceaux-2`, en version plus récente ;
   - le dossier `.claude-plugin/` du worktree est identique au `.claude-plugin/marketplace.json` suivi sur `main` (`diff -rq` vide).
