# Relecture croisée – #946 (1.159.4)

> Écrite le 25 septembre 2026, vers 10 h 40 (Toronto), par Cowork. Objet relu : branche `fix/946-cartouche-copie-evaluee`, sommet `babf2504` (correctif `9ba02569`), base `aa5579e8`.

## Verdict : VERT, avec UNE retouche demandée avant la fusion (un essai à ajouter, aucun code applicatif)

## Comment j'ai relu (par exécution, pas seulement par lecture)

- Copie `git archive` de `babf2504` (index.html, js, css, libs, tests) exécutée dans mon conteneur, **en Chromium** (`playwright.chromium.config.js`) : pas de WebKit de mon côté. Un vert Chromium est un indice, pas un verdict Safari ; ton verdict WebKit fait foi.
- Seule retouche de MA copie : le filtre d'erreurs du banc ignore aussi « Echec chargement » (les images de la bibliothèque de tampons n'étaient pas dans mon archive). Rien de tel à changer chez toi.
- Banc `cartouche-copie-evaluee-fait-foi-946` : **6 / 6 verts**.
- L'archive de relecture est restée dans `tests/test-results/relecture-946-cowork.tgz` (ignoré par git) ; tu peux l'effacer.

## Réponses à tes deux questions

1. **Les poseurs de cartouche au menu.** Des cinq chargeurs de #944, deux posent la cartouche du MODÈLE (`chargerProduction`, `demarrerEvaluationDepuisFichier`) : les deux passent par `_cartoucheModelePourLaCopie`. Les trois autres posent celle de l'évaluation (`verifierEtChargerEvaluationExistante`, `_chargerCartoucheDropdownModif`) ou la dernière mémorisée (`travaux-ui.js` ≈ l. 5165). Aucun oubli.
2. **Le retrait des +300 ms.** Aucun chemin trouvé qui vide le menu après la pose immédiate sur une copie sans évaluation. Ma mutation C4 (réapplication remise MAIS gardée) reste verte : elle ne servait plus qu'à écraser. Retrait approuvé (zéro-dette).
- Au passage, vérifié : sans la pose du modèle, `evaluationEnCours.cartoucheId` reçoit bien la cartouche de l'évaluation (`verifierEtChargerEvaluationExistante` appelle `cartoucheSelectionnee()`, ≈ l. 695, puis l'écrit ≈ l. 755). « Enregistrer » lit le menu (`evaluation.js` ≈ l. 1790) : ton mécanisme décrit est le bon.

## Mes mutations (différentes des tiennes)

| | Mutation | Résultat | Lecture |
|---|---|---|---|
| C1 | `verifierEtChargerEvaluationExistante` n'écrit plus `evaluationEnCours.cartoucheId` (≈ l. 755) | vert | Redondant avec `cartoucheSelectionnee()` (≈ l. 695) : mutant équivalent, pas un trou. |
| C2 | le modèle se pose sur une copie évaluée **sans** cartouche | **vert** | **Trou de preuve : la retouche ci-dessous.** |
| C3 | garde de la visionneuse calculée sur `fichier.productionId` | vert | Égal à `productionIdEffective` dans la fixture ; ton choix est le bon, pas d'essai exigé. |
| C4 | réapplication +300 ms remise, mais gardée | vert | Attendu (voir question 2). |
| C5 | garde de `chargerProduction` lue sur `evaluationEnCours.etudiantDA` | vert | Mutant équivalent dans ces parcours. |

## La retouche demandée

**Le lot change un comportement que rien ne fige : une copie évaluée SANS cartouche.** Avant : par le menu « Production » (grilles mixtes), elle recevait la cartouche de la production, et « Enregistrer » l'écrivait. Après : elle n'en reçoit plus. **Je retiens le comportement du lot** (décision technique de Cowork) : c'est la règle de Grégoire (ce qui est enregistré fait foi, et rien n'a été enregistré), et c'est déjà ce que fait la visionneuse (`_chargerCartoucheDropdownModif` vide le menu). Les trois chemins s'accordent maintenant.
⮕ Ajoute un essai : copie évaluée sans `cartoucheId`, grilles mixtes, production qui prévoit `CT946R`, ouverte par « Consulter » et par le menu « Production » → le menu reste sans cartouche et « Enregistrer » n'écrit pas `CT946R`. Il doit rougir sous C2. Cite-le dans la fiche.

## La trouvaille de `travaux-ui.js` – ma disposition : **inscrire** (issue 2)

Pas du code du lot, et pas causé par lui : dans la visionneuse, `_chargerCartoucheDropdownModif` vidait déjà le menu d'une copie évaluée sans cartouche, avant comme après. Mais la restauration du cache y pose alors la **dernière cartouche mémorisée**, venue d'une autre copie, peut-être d'une autre production, et « Enregistrer » l'écrirait. C'est une écriture silencieuse dans une évaluation, et elle est dans le cap de Grégoire (la rétroaction). Ligne à poser au BACKLOG, numéro suivant :

> **#947 — Dans la visionneuse, une copie évaluée sans cartouche reçoit la dernière cartouche mémorisée** (trouvaille du lot #946 ; disposition : inscrit, issue 2). `[lecture]` `js/travaux-ui.js` ≈ l. 5165 : la restauration des sélections pose `selectionsCache.cartouche` quand le menu est vide ; `_chargerCartoucheDropdownModif` laisse vide le menu d'une évaluation sans `cartoucheId`. « Enregistrer » lit le menu et l'écrirait. Non vécu ; non mesuré au navigateur.

Cowork l'ajoute à `FILE-DES-LOTS.md`, sous le cap du 24 sept. au soir.

## Nouvelles

Texte de Cowork, versé tel quel ; **validation de Grégoire à obtenir** avant le push.
