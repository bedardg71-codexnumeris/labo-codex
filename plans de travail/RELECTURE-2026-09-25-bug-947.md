# Relecture croisée – #947 (1.159.7)

> Écrite le 25 septembre 2026, vers 14 h 15 (Toronto), par Cowork. Objet relu : branche `fix/947-visionneuse-memoire-copie-evaluee`, sommet `2a7aa21e` (correctif `f87c7b29`), base `origin/main`.

## Verdict : VERT, sans retouche

## Comment j'ai relu (par exécution)

- Copie `git archive` de la branche, exécutée dans mon conteneur **en Chromium** (pas de WebKit de mon côté ; ton verdict WebKit fait foi). Seule retouche de MA copie : le filtre d'erreurs du banc ignore aussi « Echec chargement » (images absentes de mon archive).
- `visionneuse-memoire-copie-evaluee-947.spec.js` : **3 / 3 verts** ; `sentinelle-947` (Vitest) : **3 / 3 verts**.
- Lu : `productionIdEffective` et `fichier` sont bien ceux de `afficherPalettesEval` ; la garde réutilise le lecteur de #939/#946 (pas de troisième recherche) ; `restaurerSelectionsEvaluation` n'avait aucun appelant et n'en a plus aucune trace dans `js/` ni `index.html`.

## Mes mutations (différentes des tiennes), une à la fois, fichier restauré (`cmp` identique)

| | Mutation | Résultat | Lecture |
|---|---|---|---|
| W1 | garde retirée | rouge (1) | |
| W2 | garde lue sur `fichier.productionId` au lieu de `productionIdEffective` | vert | Équivalent dans la fixture ; ton choix est le bon (une copie réassignée). |
| W3 | garde sur la cartouche seulement, l'échelle reste libre | rouge (1) | L'échelle est bien prouvée, pas seulement la cartouche. |

## Nouvelles

Texte de Cowork, versé tel quel ; **validation de Grégoire à obtenir** avant le push.
