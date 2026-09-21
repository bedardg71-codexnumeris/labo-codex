# Complément au lot 1.152.2 (#715, #723) – un trou de preuve, avant le push

> Écrit le 21 septembre 2026, 10 h 37 (Toronto), par Cowork, après la relecture croisée de `f1ee271c`. **Relecture : verte par exécution sur le code, un trou de preuve à fermer.** Aucun changement de comportement attendu.

## Ce que la relecture a fait

Clone de `f1ee271c`, les cinq bancs du lot seuls : 152 / 152. Cinq mutations de Cowork, différentes des tiennes :

| Mutation | Résultat |
|---|---|
| `'tous'` comparé avec une majuscule | rouge (7) |
| **sous « tous », coupe à `nombreARetenir + 1`** | **VERTE – 152 / 152** |
| « meilleurs » ne coupe plus à N | rouge (14) |
| le Comparateur sans « (N minimum) » | rouge (2) |
| libellé de colonne « Note finale (arrondie) » | rouge (2) |

## Pourquoi la survivante compte

Tous les jeux du lot ont **cinq** productions valides pour `nombreARetenir = 4` : une coupe à N + 1 prend donc tout, par hasard. Un retour partiel de la coupe (un `slice` réintroduit sous « tous » avec une autre borne, ou la borne `nombreTotal` au lieu de `nombreARetenir`) ne serait vu par aucun essai.

## Ce qui est attendu

1. Dans `sentinelle-715-tous-prend-toutes-les-productions`, un essai de COMPORTEMENT : sous « tous », **au moins N + 2 productions valides** (par exemple sept pour `nombreARetenir = 4`), dont une plus faible que toutes les autres stockée en dernier ; la note est la moyenne des sept, au chemin riche ET à l'instance.
2. Repose la mutation « coupe à N + 1 » : elle doit rougir. Empreinte restaurée, `git status` du code vide.
3. Build-only, numéro 1.152.2 inchangé ; Vitest vert. Commite avec ce fichier et `RELAIS.md` (ajout de Cowork).
4. **Puis pousse, sur le mot de Grégoire donné ici** : `scripts/pousser.sh origin main` sous `caffeinate`, en arrière-plan, **Cowork fermé** (vérifie-le), `pgrep pousser.sh` vide. Corrige le bloc de `RELAIS.md` quand c'est poussé.

## Vu, sans suite dans ce complément

- Dans `audit-pratiques-notation-config-2026-09-16`, `calculerPerformance` rend `null` pour toute STD : la sentinelle 715 juge l'instance à 77,32 sur un autre montage, donc c'est vraisemblablement le montage de ce banc (inférence, non mesurée). Commenté dans le banc, ne pas creuser ici.
- Les deux trouvailles de ton rapport (quatre valeurs en ,5 arrondies vers le bas à l'export ; « 5 tous productions » au titre du profil) sont portées à Grégoire par Cowork, pas dans ce complément.
