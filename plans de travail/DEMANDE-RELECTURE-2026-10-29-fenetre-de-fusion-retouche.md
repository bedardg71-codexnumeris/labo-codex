# Demande de relecture – La fenêtre de fusion, la retouche de mots (#1186)

> Écrite par Claude Code le vendredi 30 octobre 2026, en exécution de `VERDICT-RELECTURE-2026-10-29-fenetre-de-fusion.md`. Rien n'est poussé ; la release partira avec le lot 5 des standards.

## Ce qui est posé, mot pour mot (`js/codex.js`, `LIBELLES_DES_CLES`)

| Point du verdict | Résultat |
|---|---|
| 1. En énumération | « ta grille en cours dans « Apporter mon matériel » » ; en tête : « Viendront de l'autre codex, sans question : 18 évaluations, 18 annotations, 18 durées d'évaluation et ta grille en cours dans « Apporter mon matériel ». » |
| 1. En titre de rangée | « Ta grille en cours », sous « Conception › Apporter mon matériel » (champ `titre` neuf de la table) |
| 3. La fin | « Versions de l'autre codex retenues : … » remplace « Version de l'autre codex gardée pour : … » |
| 4. Sous une clé-objet | « 1 autre réglage identique », « N autres textes identiques », « N autres tampons identiques » ; « élément » en repli (champ `unite`) |

Les autres noms du point 2 n'ont pas bougé. « 1 autre différence » reste : le verdict ne le vise pas.

## Une supposition à juger

**Ce que dit chaque côté d'une rangée « Ta grille en cours ».** Le verdict donne le titre, pas les côtés. Sans rien faire, la rangée aurait montré les entrées internes du brouillon (`doc : 3 propriétés`, voire `format`, qui contient « dissection »). J'ai décidé : le côté dit le nom de la grille, `« Grille fictive »`, ou **« Grille sans nom »** (champ `cote` de la table). Limite : deux grilles au même nom affichent le même texte des deux côtés, sans date à montrer. Cette rangée n'a pas été vécue : aucun des codex mesurés le 29 oct. n'a ce conflit (la clé n'existait que d'un côté).

## Les preuves

- `sentinelle-1186-fenetre-de-fusion` : 14 verts (4 neufs : le nom suit la clé, la rangée de la grille en cours, le haut de la fenêtre, la fin), `sentinelle-1182` et `sentinelle-contenir-complexite` verts.
- **Break-test** : le nom de `brouillonDissection` rendu à l'ancien → 2 rouges (la fin, le haut de la fenêtre) ; arbre restauré, sha256 identique.
- WebKit : `codex-1186-fenetre-de-fusion` et `codex-1182-fusion-copie-par-copie`, 3 verts.
- Vitest complet et Playwright complet : pas rejoués ici, ils le seront avec le lot 5.
