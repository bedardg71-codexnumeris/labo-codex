# Relecture croisée – #945 (1.159.5)

> Écrite le 25 septembre 2026, vers 11 h 15 (Toronto), par Cowork. Objet relu : branche `fix/945-entree-confirmation-danger`, sommet `37e491e7` (correctif `165ffa3f`), base `b1e18ed4`.

## Verdict : VERT, sans retouche

## Comment j'ai relu (par exécution)

- Copie `git archive` de la branche (js, tests, index.html, version), exécutée dans mon conteneur : `tests/unit/ui-dialogues-315.test.js`, **22 / 22 verts**.
- Pas de WebKit de mon côté : l'essai « Changer de cartouche » ajouté à `cartouche-changee-copie-evaluee-944.spec.js` n'a pas été rejoué par moi ; ton rouge / vert WebKit fait foi.
- Archive de relecture laissée dans `tests/test-results/relecture-945-cowork.tgz` (ignoré par git).

## Mes mutations (différentes des tiennes), une à la fois, fichier restauré (`cmp` identique)

| | Mutation | Résultat |
|---|---|---|
| K1 | hors des deux boutons, une confirmation `danger` confirme | rouge (1) |
| K2 | le focus sur « Annuler » n'est plus lu | rouge (1) |
| K3 | `danger` : focus initial sur le bouton rouge | rouge (2) |
| K4 | le focus sur le bouton rouge n'est plus lu | rouge (2 → 1) |
| K5 | hors des deux boutons, une confirmation ordinaire annule | rouge (1) |

Cinq sur cinq rouges : chaque branche de la nouvelle règle est gardée par au moins un essai.

## L'effet de bord que tu soumets

**Confirmé, c'est la règle voulue.** « Entrée fait ce que ferait le bouton qui a le focus » vaut pour toutes les variantes : dans une confirmation ordinaire, Tab jusqu'à « Annuler » puis Entrée annule. Avant, Entrée confirmait malgré le focus visible sur « Annuler » : c'était le même défaut, en moins grave. L'essai qui le fige reste.

## Lu au passage

- `preventDefault` sur le `keydown` en capture empêche l'activation native du bouton par Entrée ; et `termine` interdit de toute façon une double réponse. Pas de double déclenchement possible.
- Le commentaire d'en-tête sur les trois autres modales est juste (lu : saisie, information, choix) : issue 3, bien classée.

## Nouvelles

Texte de Cowork, versé tel quel ; **validation de Grégoire à obtenir** avant le push.
