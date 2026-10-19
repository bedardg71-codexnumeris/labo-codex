# Demande de relecture – brancher la vérification complète sur GitHub : la fusion (temps A)

> Claude Code, lundi 19 octobre 2026, 13 h 46 (Toronto, mesuré par `date`). Consigne : `CONSIGNE-LOT-2026-10-19-fusion-verdict-github.md` (13 h 40), temps A. Pour Cowork (`PROTOCOLE.md`, règle 2).
> Un commit de fusion sur `main`, **non poussé**. **Pas de verdict complet, pas de push.**

## Ce qui est fait

0. **Mesuré avant la fusion.**
   - `main` est à `4d029ac1` et `origin/ci/verdict-morceaux-2` à `fb20d986` (5 commits).
   - La base commune est `eb6dd86e`. Depuis elle, `main` n'a touché, parmi les fichiers du lot, que `BACKLOG.md`. Conforme à la mesure de Cowork.
1. **Les deux copies non suivies** (`CONSIGNE-` et `DEMANDE-RELECTURE-2026-10-16-verdict-sur-github.md`) : identiques octet pour octet à celles de la branche (`cmp`). Retirées, la fusion les ramène.
2. **La fusion** : `git merge --no-ff origin/ci/verdict-morceaux-2`, un commit de fusion, pas de rebase. Les cinq commits de la branche restent tels qu'ils ont été relus.

## Les conflits et leur résolution

Un seul fichier en conflit, `BACKLOG.md`, avec les deux conflits attendus.

| Conflit | Résolution |
|---|---|
| La ligne « Dernier ID utilisé » (`main` : #1110 ; branche : #1090) | **#1111**, qui dit d'où il vient. La suite de la ligne est celle de `main`, à partir de #1110. |
| La fin de la liste des fiches (`main` : les sections du 16 au 19 oct. ; branche : « Verdict sur GitHub, 16 octobre ») | Les deux, celle de `main` d'abord, puis celle de la branche, sa fiche renumérotée. |

## Les numéros (verdict du 17, points 1 et 2)

- **#1111** : la PR Dependabot de Vitest 5 qui ne s'installe pas, ex-#1090 de la branche.
  - Premier numéro libre, remesuré : le plus haut dans `BACKLOG.md`, `BACKLOG-ARCHIVE.md` et `SUIVI-BUGS.md` est #1110 ; #1111 n'apparaît que dans la consigne.
  - Une phrase sous le titre de sa section dit la renumérotation.
- **#1090 de `main`** (la grille partagée sans son échelle) garde son numéro. #1096, qui s'y rattache, aussi.
- **#1094** : clos, en renvoyant au point 2 du verdict du 17 (c'est le comportement voulu).
- **Laissé tel quel** : `DEMANDE-RELECTURE-2026-10-16-verdict-sur-github.md` parle encore de « #1090 : la PR Dependabot ». C'est un document relu, daté ; je ne l'ai pas réécrit. **Supposition** : un document relu garde ses mots, et le BACKLOG porte la correspondance.
- **Point 4 du verdict** (la branche locale `ci/verdict-morceaux` et son worktree) : non touché, il attend Grégoire (#1093).

## Point 4 de la consigne : le juge du Mac

**Le rejugement demandé est impossible.** `scripts/verifier-playwright.mjs`, l'ancien comme le nouveau, ne sait pas juger un rapport existant : il relance toujours la suite. Il écrit son rapport JSON dans un dossier temporaire et l'efface ensuite (`rmSync`). Le rapport du verdict de 10 h 25 (`22062197`) n'existe donc plus : le jeton `.verdict-playwright.json` ne garde que des comptes. **Le vrai contrôle se fera au verdict de ce soir** : la liste du Mac devra être celle de 10 h 25.

**Substitut partiel**, fait hors du dépôt (scratchpad, rien de commité) :
- **Ce que j'ai comparé :** l'ancienne logique de jugement, recopiée telle quelle depuis l'ancien script (`identite`, `echecsDuRapport`, `flakyDuRapport`, la comparaison à la baseline), et le module neuf `scripts/rapport-playwright.mjs`.
- **Sur quel rapport :** un rapport fictif, avec un vert, des rouges, un rouge dans une suite imbriquée, un chemin Windows, une spec sans `file`, un instable et un sauté.
- **Avec quelles baselines :** la vraie, qui est vide, puis une baseline fictive avec un échec connu et une spec réparée.
- **Résultat :** mêmes échecs, mêmes instables, mêmes « nouveaux » et mêmes « réparées », dans tous les cas, y compris sans baseline.
- **Le reste du script :** au diff, la fusion n'y change que l'import du module et la ligne de comparaison. Codes de sortie, jeton et gardes sont inchangés.

## Ce qui n'est pas touché (point 5)

Le crochet pré-push, `pousser.sh` et le rituel du soir : aucun fichier de la fusion ne les touche (mesuré sur le diff indexé).

## Les bancs

**Vitest complet**, depuis `tests/` : **783 fichiers, 9 308 essais verts**. Les trois sentinelles CI (`sentinelle-ci-verdict-morceaux`, `sentinelle-ci-paths-ignore`, `sentinelle-533-verdict-avant-connexion`) en font partie, 55 essais.

## Le commit porte aussi

La consigne de la fusion, la consigne du jour et son archive (`_ancienne-CONSIGNE-DU-JOUR-2026-10-19-lot-13-apres-midi.md`), `VERDICT-RELECTURE-2026-10-19-lot-13-modifier-les-reponses.md` et `VERDICT-RELECTURE-2026-10-17-verdict-sur-github.md` (absent de la branche).

## Trouvailles

Aucune hors du lot.
