# Demande de relecture – la version 1.215.0

> Claude Code, jeudi 22 octobre 2026, 18 h 45 (Toronto). Pour Cowork (`PROTOCOLE.md`, règle 2).
> Commit de release `628a7657` sur `main`, **non poussé**. Le verdict complet et le push attendent le signal de Grégoire. Cette demande et le tableau du plan ne sont pas commités, pour que le commit de release reste le dernier (même choix qu'à la 1.214.0).

## Ce que portent les commits

| Quoi | Comment le vérifier |
|---|---|
| Les docs de Cowork | `a7a879c8` : le verdict, les textes, la consigne et son archive, seuls. |
| Les textes validés (`1f853209`) | `js/evaluation-enonces.js` : `NOMS_DE_REPLI` (renommé depuis `NOMS_PROVISOIRES`) porte « élément examiné / éléments examinés » (Grégoire, 18 h 29) ; les aides de `{nomErreurs}` et `{nomMots}` sont celles de Cowork, mot pour mot. L'invitation d'Annoter lit le repli (`js/travaux-outils.js`) et dit « « élément relevé » et « élément examiné » ». Les commentaires « provisoire » de l'étape 2a disent « validé » (`grilles.js`, `travaux-outils.js`, `evaluation-enonces.js`). `TEXTES-2026-10-22-…` est mis au même texte (en-tête, § 3, § 7). Aucun banc ne figeait « unité » sauf l'essai A.a de `critere-algorithmique-noms.test.js`, qui suit. |
| Les Nouvelles 1.215 | `js/changelog-data.js`, en tête : `vert`, « Nommer ce que tu comptes », deux items, insécables en `&nbsp;` comme la 1.214. ⚠ Une seule liberté, typographique : les apostrophes sont typographiques (’), comme dans les items de la 1.214 ; les mots sont ceux de la consigne. |
| La version | `node scripts/release.mjs minor` (précédé de `--dry-run`) : **1.215.0**, build `1022-1833`, dans les quatre points. `git grep` de l'ancien build `1022-1318`, de son jeton `10221318` et de « 1.214.0 » hors `*.md` : zéro ; témoin, `1022-1833` dans les quatre fichiers. |
| Le relais | `RELAIS.md`, un bloc de tête, avec la ligne « complexité ». `OU-EN-EST-ON.md` attend le push. |

## Complexité (1.214.0 `fbfa393e` → 1.215.0)

Fichiers de plus de 1 000 lignes 37 → 37, leurs lignes 88 426 → 88 578 (Δ +152) ; au-dessus de 15 : 454 → 453 (Δ −1, `construireConcentration`, en `efad6af1`) ; au-dessus de 30 : 86 → 86 (maximum 130) ; somme au-dessus de 15 : 11 431 → 11 415 (Δ −16).

## Preuves

- **Vitest complet** (après `1f853209`, la release ne touche que textes et version) : 9 514 sur 9 514, 809 fichiers.
- **WebKit sur `628a7657`** : 19 specs, 53 essais verts — le critère algorithmique, le texte troué, le PDF, le parcours sommatif, et `bandeau-maj-chargement` (la version affichée).
- **Audit statique** du diff `64b746fc..628a7657` dans `js/` : aucun `console.log`, `eval`, handler inline ajouté. Pas de break-test dans ce dernier lot : textes et version seulement (consigne § 4).
- **Non fait** : le verdict Playwright complet (au signal de Grégoire).

## Un constat, sans suite à donner

`efad6af1` a embarqué treize documents d'autres jours de `plans de travail/` (un `git add` du dossier entier), comme le verdict l'a relevé. Rien n'est perdu ni écrasé : ils étaient non suivis. Depuis, chaque commit n'ajoute que des fichiers nommés.

## Le geste à vérifier à l'écran, après le push

Ouvre les Nouvelles : la 1.215 « Nommer ce que tu comptes » est en tête ; puis crée un critère algorithmique neuf, évalue une copie sans lui donner de noms, et lis « Ta production contient … éléments relevés pour … éléments examinés ».
