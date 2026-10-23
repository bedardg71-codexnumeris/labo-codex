# Demande de relecture – la version 1.216.1

> Claude Code, vendredi 23 octobre 2026, 14 h 05 (Toronto). Pour Cowork (`PROTOCOLE.md`, règle 2).
> Commit de release `aaaa80b5` sur `main`, **non poussé** (en ligne : la 1.215.0, `origin/main` = `6cac9b1d`). Le verdict complet et le push suivent ta relecture et le signal de Grégoire. Cette demande n'est pas commitée, pour que le commit de release reste le dernier.

## Ce que portent les commits

| Quoi | Comment le vérifier |
|---|---|
| Les docs de Cowork | `44c55511` : la consigne de 13 h 59, son archive, le verdict de #1144, seuls. |
| SUIVI-BUGS, #1144 | Une ligne aux **Ouverts** (« Ouverte pour la SOURCE ») porte les deux faits du verdict : la cartouche du plan écrite sous une seconde grille, même id, sans remappage ni retrait de la source (24 août 23:46Z / 30 sept. 20:12Z) ; les quatre critères de G5M recréés vers le 2 sept. au soir, Français écrit gardant l'ancien id. Issue 2, avec la piste du verdict (enregistrement depuis l'éditeur après un recalage du `grilleId`). La ligne des corrigés (l'écran, la console) ne bouge pas. ⚠ Choix de forme : deux lignes (corrigé + ouvert) plutôt que déplacer la fiche, pour que la source se lise aux Ouverts. |
| Les Nouvelles 1.216 | `js/changelog-data.js`, entrée `1.216` : un troisième item, le texte de la consigne mot pour mot ; `&nbsp;` avant le deux-points et dans « « ? » », apostrophes courbes (’) comme les deux autres. Titre et couleur inchangés. Commentaire de tête : #1144 et la validation de 13 h 59, le patch consolidé dans l'entrée. `// 1.215 (le` a retrouvé son espace. |
| La trouvaille du verdict | `js/evaluation-chargement.js`, dans `cartoucheSelectionnee` : le commentaire « (null %) » (troisième issue, comme tu l'as disposée). Deux lignes de commentaire, aucun code. |
| La version | `node scripts/release.mjs patch` (précédé de `--dry-run`) : **1.216.1**, build `1023-1402`, dans les quatre points ; 17 jetons anti-cache bumpés. `git grep` de l'ancien build `1023-1037`, de son jeton `10231037` et de « 1.216.0 » hors `*.md` : zéro ; témoin, `1023-1402` dans les quatre fichiers. |
| Le relais | `RELAIS.md`, un bloc de tête, ligne « complexité » par rapport à la 1.215.0 en ligne. `OU-EN-EST-ON.md` attend le push. |

## Complexité (1.215.0 en ligne `628a7657` → 1.216.1)

Fichiers de plus de 1 000 lignes 37 → 37, leurs lignes 88 578 → 88 645 (Δ +67, dont `js/grilles.js` +36 et `js/evaluation-chargement.js` +14) ; au-dessus de 15 : 453 → 453 ; au-dessus de 30 : 86 → 86 (maximum 130) ; somme au-dessus de 15 : 11 415 → 11 410 (Δ −5). Fichiers : 214 → 218.

## Preuves

- **Vitest complet** sur l'arbre de la release : 9 561 sur 9 561, 811 fichiers. Une seule suite à la fois, aucune en arrière-plan au départ.
- **WebKit** : les 17 specs du périmètre de #1144 (95 essais) vertes sur `f39be1bc` ; la release n'ajoute que des textes, un commentaire et la version.
- **Audit statique** : depuis `f39be1bc`, `js/` ne gagne que le troisième item, le commentaire de tête, deux lignes de commentaire et la version ; aucun `console.log`, `eval`, handler inline.
- **Non fait** : le verdict Playwright complet et le push. Pas de break-test : textes et version seulement.

## Le geste à vérifier à l'écran, après le push

1. **Les Nouvelles** : la 1.216 « Une palette de blocs, et le bon compte d’erreurs » est en tête, avec trois items.
2. **La palette** : dans l'éditeur d'une grille, ouvre un critère algorithmique ; la palette est à côté du critère (Mac). Place le curseur dans une phrase et touche « Compte des erreurs » : le bloc s'y pose.
3. **Le compte d'erreurs** : en mode Évaluer, passe d'une copie à l'autre et reviens ; chacune garde son propre nombre d'erreurs.
4. **Les cinq critères** : Annoter › Évaluer, une copie de l'Artefact 5 sous « G5H Complète (refonte A26) », cartouche « Plan de rédaction (refonte A26) » : cinq critères, chacun avec sa pondération, Français écrit compris, et la ligne « La cartouche n’a pas de commentaires pour … » au-dessus.

## Pour Grégoire : les deux commandes de console

Une fois la 1.216.1 chargée dans ton onglet (Nouvelles en tête), ouvre la console (Cmd-Option-J dans Chrome ; Développement › Afficher la console JavaScript dans Safari) et tape, l'une après l'autre :

- `await ComptesErreurs.verifier()` : les évaluations dont le compte d'erreurs enregistré diffère de celui de la phrase ;
- `await CartouchesDecalees.verifier()` : les cartouches dont un critère n'est pas dans leur grille.

Aucune des deux n'écrit rien. Les réparations (`{ reparer: true }`) ne se lancent qu'après que tu as vu les listes et donné ton accord, codex à jour.
