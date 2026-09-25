# Demande de relecture croisée – #947 (1.159.7)

> Écrite le 25 septembre 2026, vers 14 h 10 (Toronto), par Claude Code. Branche `fix/947-visionneuse-memoire-copie-evaluee` (arbre principal, non poussée) : `f87c7b29` (correctif, bancs, release, consigne versée et l'ancienne archivée), puis le commit de cette demande. Base : `55d8a522`.
> Consigne : `plans de travail/CONSIGNE-DU-JOUR.md` (Cowork, 25 sept. vers 11 h 45). Verdict attendu dans `plans de travail/RELECTURE-2026-09-25-bug-947.md`.

## § 2.1 · La mesure, faite en premier (WebKit, par la vraie visionneuse, sur `55d8a522`)

Le banc donne à la copie une évaluation sans cartouche ni échelle. La mémoire contient une autre cartouche et une autre échelle, comme si l'on venait d'évaluer une AUTRE copie. La production n'en prévoit aucune.

```
[947 évaluée sans cartouche] {"cartouche":"CT947M","echelle":"E947M","grille":"G947",...,"baseCartouche":"","baseEchelle":""}
[947 après Enregistrer]      {"cartouche":"CT947M","echelle":"E947M",...,"baseCartouche":"CT947M","baseEchelle":"E947M"}
```

**Le défaut se reproduit, et il est plus large que la fiche :** l'échelle est touchée aussi, comme tu l'avais demandé de mesurer. « Enregistrer » écrit les deux valeurs dans l'évaluation.

## § 2.2 · Le correctif

- **Dans `js/travaux-ui.js`**, la restauration à +2,5 s demande d'abord au lecteur de #939 et #946 si la copie a une évaluation enregistrée. Si c'est le cas, elle ne restaure rien : ni grille, ni échelle, ni cartouche. Elle débloque la mémorisation et sort. L'élève et la production transmis au lecteur sont ceux du fichier et de `productionIdEffective`. Il n'y a pas de troisième recherche.
- **Dans `js/evaluation-chargement.js`**, le lecteur est exposé sur `window` en une ligne, commentée « #947 ». C'est une fonction déclarée en tête du fichier, mais je ne compte pas sur la portée globale implicite : la sentinelle vérifie l'exposition.
- **J'ai choisi de ne restaurer aucune des trois valeurs**, grille comprise, plutôt que l'échelle et la cartouche seulement. Sur une copie évaluée, le chargeur de l'évaluation pose déjà la grille. La mémoire n'a rien à y ajouter, et c'est la règle du § 0.
- **Code mort** : `restaurerSelectionsEvaluation` (`js/evaluation.js`, 87 lignes) est retirée. Je l'ai remesurée avant de la retirer : aucun appelant dans `js/`, dans `index.html` ou dans `tests/`, et aucune exposition sur `window`. Le retrait ne touche qu'une seule fonction. `sauvegarderSelectionsEvaluation` et `memoriserSelectionsEvaluation` ont des appelants ; elles restent.

## § 3 · Limites

- **Stock assumé.** Des évaluations ont peut-être déjà reçu une cartouche ou une échelle de la mémoire, et rien ne permet de les reconnaître. Aucune donnée n'est réécrite. C'est écrit dans la fiche.
- Une copie **sans** évaluation garde la restauration telle quelle. L'essai 3 le vérifie : cartouche et échelle de la mémoire posées.
- Je n'ai touché ni #944 ni #946. Les 8 essais WebKit de #946 sont verts avec le correctif.
- Règle 6 : aucun nom d'élève réel ; les DA sont `TEST947` et `TEST949`.

## § 4 · Preuves

- **WebKit, `tests/integration/visionneuse-memoire-copie-evaluee-947.spec.js`, 3 essais :**
  - (1) copie évaluée sans cartouche ni échelle : rien n'est posé, rien n'est écrit. **Rouge sur `55d8a522` par le symptôme exact**, vert après le correctif.
  - (2) copie évaluée avec sa cartouche et son échelle : elle les garde.
  - (3) copie sans évaluation : la mémoire pré-remplit la cartouche et l'échelle.

  Une remarque sur l'essai 3 : je n'y compare pas le pivot. `window.evaluationEnCours.cartoucheId` reste vide même avant le correctif, alors que le menu porte la cartouche. C'est l'affaire des deux liaisons de `evaluationEnCours`, et « Enregistrer » lit le menu.
- **Vitest, `tests/unit/sentinelle-947-visionneuse-memoire-copie-evaluee.test.js`, 3 essais :** la garde et sa sortie, l'exposition sur `window`, et l'absence de `restaurerSelectionsEvaluation` dans tout `js/` et dans `index.html`, avec un témoin qui vérifie que plus de 50 fichiers ont été balayés.
- **Mutations**, une à la fois, restaurées par copie avec `cmp` identiques :

| | Mutation | Vitest | WebKit |
|---|---|---|---|
| M1 | garde retirée (`if (!selectionsCache)`) | rouge | rouge |
| M2 | garde toujours vraie | rouge | rouge (essai 3) |
| M3 | lecteur non exposé sur `window` | rouge | rouge |
| M4 | `restaurerSelectionsEvaluation` revenue | rouge | — |

- **Vitest complet** : 7 397 essais verts, aucune ligne `Errors` ni `Unhandled`.
- **Anti-cache** : `travaux-ui.js?v=20260925c`, `evaluation-chargement.js?v=20260925c`, `evaluation.js?v=20260925a`, puis `release.mjs` pour les fichiers de version.
- Version **1.159.7** (patch), build 0925-1400.

## Nouvelles

J'ai écrit ton texte dans `js/changelog-data.js`, marqué « À VALIDER par Grégoire avant le push » :

> Évaluer&nbsp;: dans la visionneuse, une copie déjà évaluée ne reçoit plus la dernière grille, échelle ou cartouche que tu as utilisée ailleurs&nbsp;; elle garde ce qui a été enregistré avec elle.

## Ce qui suit

Après ton verdict, et une fois les Nouvelles validées par Grégoire : fusion dans `main`, verdict Playwright (Cowork fermé), puis push.
