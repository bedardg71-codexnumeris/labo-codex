# Demande de relecture – la version 1.216.0

> Claude Code, vendredi 23 octobre 2026, 10 h 40 (Toronto). Pour Cowork (`PROTOCOLE.md`, règle 2).
> Commit de release `56f7be93` sur `main`, **non poussé**. Le verdict complet et le push attendent le signal de Grégoire. Cette demande et la ligne du plan ne sont pas commitées, pour que le commit de release reste le dernier (même choix qu'aux 1.214.0 et 1.215.0).

## Ce que portent les commits

| Quoi | Comment le vérifier |
|---|---|
| Les docs de Cowork | `d04f8324` : la consigne de 10 h 36 et son archive, seules. |
| Les Nouvelles 1.216 | `js/changelog-data.js`, en tête : `vert`, « Une palette de blocs, et le bon compte d’erreurs », deux items, insécables en `&nbsp;` comme la 1.215. ⚠ Une seule liberté, typographique : les apostrophes sont courbes (’), y compris celle du titre ; les mots sont ceux de la consigne. « « Poser : » » est écrit `«&nbsp;Poser&nbsp;:&nbsp;»`. |
| La version | `node scripts/release.mjs minor` (précédé de `--dry-run`) : **1.216.0**, build `1023-1037`, dans les quatre points ; 22 jetons anti-cache d’`index.html` passés à `20261023a`. `git grep` de l’ancien build `1022-1833`, de son jeton `10221833` et de « 1.215.0 » hors `*.md` : zéro ; témoin, `1023-1037` dans les quatre fichiers. |
| Le relais | `RELAIS.md`, un bloc de tête, avec la ligne « complexité » et la phrase sur le stock de #1142, non réparé. `OU-EN-EST-ON.md` attend le push. |

## Complexité (1.215.0 `628a7657` → 1.216.0)

Fichiers de plus de 1 000 lignes 37 → 37, leurs lignes 88 578 → 88 663 (Δ +85, dont `js/grilles.js` +70) ; au-dessus de 15 : 453 → 453 ; au-dessus de 30 : 86 → 86 (maximum 130) ; somme au-dessus de 15 : 11 415 → 11 410 (Δ −5). Deux fichiers neufs : `js/palette-algo.js`, `js/comptes-erreurs-stock.js`. Mesure de la 1.215.0 prise dans un worktree détaché sur `628a7657`, retiré ensuite.

## Preuves

- **Vitest complet** sur l’arbre de la release (Nouvelles et version comprises) : 9 540 sur 9 540, 810 fichiers. Une seule suite à la fois : l’audit de début de session avait lancé le sien (même compte, sur `603dad65`) ; le mien est parti après lui, aucun shell actif au départ.
- **Audit statique** du diff `6cac9b1d..56f7be93` dans `js/` (lignes ajoutées) : aucun `console.log`, `eval`, handler inline.
- **Non fait** : le verdict Playwright complet et le push (au signal de Grégoire). Pas de break-test dans ce lot : textes et version seulement.

## Le geste à vérifier à l’écran, après le push

Ouvre les Nouvelles : la 1.216 « Une palette de blocs, et le bon compte d’erreurs » est en tête. Puis, dans l’éditeur d’une grille, ouvre un critère algorithmique : la palette est à côté du critère (Mac) ; place le curseur dans une phrase et touche « Compte des erreurs » : le bloc s’y pose. Enfin, en mode Évaluer, passe d’une copie à l’autre et reviens : chacune garde son propre nombre d’erreurs.

## Pour Grégoire : mesurer le stock de #1142

Une fois la 1.216.0 chargée dans ton onglet (Nouvelles en tête), ouvre la console (Développement › Afficher la console JavaScript dans Safari, ou Cmd-Option-J dans Chrome), tape `await ComptesErreurs.verifier()` puis Entrée : il liste les évaluations du trimestre actif dont le compte enregistré diffère de celui de la phrase, et **n’écrit rien**. La réparation (`await ComptesErreurs.verifier({ reparer: true })`) ne se lance qu’après que tu as vu la liste et donné ton accord.
