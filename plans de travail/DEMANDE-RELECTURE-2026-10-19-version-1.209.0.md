# Demande de relecture – la version 1.209.0

> Claude Code, lundi 19 octobre 2026, 19 h 40 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-19-version-1.209.md`, temps A. Pour Cowork (`PROTOCOLE.md`, règle 2).
> Commit de release `e7d8c1ed` sur `main`, **non poussé**. Avec ce fichier, `main` a 12 commits d'avance sur `origin/main` (`22062197`). **Pas de verdict, pas de push** : temps B, au second relais.

## Ce que le commit de release change

| Quoi | Où | Comment le vérifier |
|---|---|---|
| Trois refus de points, mot pour mot | `js/grilles.js`, `REFUS_REPONSES` | `pointsSouligne` : « Les points ne peuvent pas commencer par « _ » » ; `pointsHorsBornes` : « Les points vont de 0 à 100 » ; `pointsLongs` : « Les points font 200 caractères au plus ». Les quatre autres refus sont inchangés. |
| Plus de « PROVISOIRE » au lot 13 | `js/grilles.js` | `grep -rn PROVISOIRE js/grilles.js` ne rend rien. Deux commentaires portent « validé G. 19 oct. 19 h 29 » : celui du rendu et celui de `REFUS_REPONSES`. |
| Le banc qui cite les refus | `tests/unit/materiel-dissection-13-modifier-les-reponses.test.js` | 4 citations remplacées : 1 pour le premier refus, 2 pour le deuxième, 1 pour le troisième. |
| Entrée 1.209 des Nouvelles, en tête, `vert` | `js/changelog-data.js` | Titre et trois items, mot pour mot. Insécables (`&nbsp;`) et apostrophes typographiques comme la 1.208. Les entrées 1.208 et 1.207 sont intactes. |
| Bump minor | `scripts/release.mjs` | 1.208.0 → **1.209.0**, build 1019-0911 → **1019-1934**. Les quatre points concordent (`version.json`, `version.js`, `js/init-inline.js` ×2, `js/main.js`). Je n'ai trouvé l'ancien build nulle part (`git grep 1019-0911` sur ces fichiers, `js/` et `index.html` : rien). Le script a mis à jour les jetons de 16 fichiers ; j'ai bumpé à la main celui de `grilles.js`. |

## Preuves

- **Vitest complet**, avant le bump et **après le commit de release** : 784 fichiers, **9 207 sur 9 207 verts** les deux fois.
- **Break-test du lot 13**, refait ce soir : la borne 0-100 neutralisée → `P.d les refus des points` rouge (1 sur 16) ; le code restauré → 16 sur 16. J'ai vérifié que le diff ne gardait que les trois textes.
- **Audit statique** des lignes ajoutées depuis la 1.208.0 (`js/`, `index.html`) : aucun gestionnaire en ligne, aucun `eval`, aucun `console.log`, aucune zone protégée. Un seul `innerHTML` neuf, dans `materiel.js` (`confirmationHtml`, déjà relu au lot du retrait).
- **Specs touchées** : aucun `page.click` ni `waitForTimeout`.

## La ligne « complexité » (1.208.0 → 1.209.0)

Mesurée par `node tests/unit/_helpers/complexite.js`, sur `b0f3e2a6` (dans un arbre temporaire, retiré depuis) et sur `HEAD`.

| | 1.208.0 | 1.209.0 |
|---|---|---|
| Au-dessus de 15 | 454 | **454** |
| Somme au-dessus de 15 | 11 439 | 11 439 |
| Au-dessus de 30 | 88 | 88 |
| Lignes des fichiers de plus de 1 000 | | **+171** (`grilles.js` 3 686 → 3 828, `accompagnement-contenu-popup.js` +18, `changelog-data.js` +10, `accompagnement.js` +1) |
| Lignes de `js/` | 151 329 | 150 280 |

## Ce que je demande de regarder

1. L'entrée des Nouvelles, à côté de la consigne. Item 1 : « change leurs points » vaut pour une grille en points seulement. Avec une échelle, seul le texte se modifie, et l'écran le dit. Le texte est validé tel quel, je le signale sans y toucher.
2. Rien d'autre n'est neuf dans ce commit.
