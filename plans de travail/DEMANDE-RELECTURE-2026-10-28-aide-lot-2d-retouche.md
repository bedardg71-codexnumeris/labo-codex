# Demande de relecture – L'Aide, lot 2d, la retouche (#1152)

> Claude Code, mercredi 28 octobre 2026, sur `main` (base `e365a49f`). Verdict : `VERDICT-RELECTURE-2026-10-28-aide-lot-2d.md` (Cowork, 13 h 13). Commit de la retouche : `69383dec`. Non poussé, pas de release, pas de verdict Playwright complet.

## En bref

- **Retouche 1 faite** : la question de la FAQ devient « Puis-je modifier les seuils des indices A et C ? ». La réponse ne change pas : elle ne parlait déjà que de A et C.
- **Retouche 2** : le titre « Glossaire du parcours » et les deux phrases de `pan` étaient déjà posés mot pour mot ; leur texte n'a pas bougé. La validation (« validé par Grégoire le 28 oct. 2026 à 13 h 14 (« on garde »), mot pour mot ») est notée dans le commentaire HTML de `pan` et de `glossaire`.
- Le commentaire de la FAQ dit pourquoi la question ne porte plus « M » (le filtre « A ou C », `js/tableau-bord-apercu.js:445`).
- **Aucun fichier `js/` touché.**
- Tests : Vitest complet, depuis `tests/`, **841 fichiers, 10 083 sur 10 083** (10 082 + 1 essai neuf) ; Playwright ciblé, **2 sur 2** (`aide-lot-2d-1152`, `aide-forme-1152`). Aucun banc Playwright ne cite la question.

## Les sentinelles

- `tests/unit/sentinelle-audit-aide-15-oct-ce-que-fait-l-application.test.js:206` : la nouvelle ancre, avec un commentaire qui cite ce verdict.
- `tests/unit/sentinelle-aide-2026-10-28-lot-2d.test.js` :
  - la liste des questions de la FAQ porte la nouvelle question, et « A, C, M » ou « A/C/M » est interdit dans la FAQ ;
  - un essai neuf : le titre du glossaire, les deux phrases de `pan` entières, et la mention de la validation dans le commentaire qui précède chacune des deux entrées.

**Break-test** : 4 mutations, 4 rouges (l'ancienne question remise, la mention retirée du commentaire de `pan`, puis de celui de `glossaire`, un mot changé dans la seconde phrase de `pan`). Arbre restauré, identique à la copie (`cmp`).

## Ce que j'ai supposé

- Le verdict nomme « le commentaire HTML des deux entrées » : `pan` et `glossaire`. J'ai lu `glossaire` comme l'entrée qui porte le titre neuf, et non `glossaire-statique`, qui reste intacte (lot 3).

## Trouvé en chemin

Rien.

## Le geste à vérifier à l'écran après la mise en ligne

Aide › Référence › FAQ : la dernière question dit « A et C », sans « M ».
