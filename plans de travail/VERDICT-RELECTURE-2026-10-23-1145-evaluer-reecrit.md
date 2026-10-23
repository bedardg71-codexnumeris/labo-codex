# Verdict de relecture – #1145 : « Évaluer » qui réécrivait une évaluation ; la cartouche du plan rangée sous G4H

> Cowork, vendredi 23 octobre 2026, 18 h 02 (Toronto, mesuré par `date`). Relu : `1024de84`, `3a14c2f2` et `7500ebc9` (non poussés), la demande `DEMANDE-RELECTURE-2026-10-23-1145-evaluer-reecrit.md` et le rapport de Claude Code (18 h). Mesure dans les données de Grégoire : Chrome, lecture seule d'IndexedDB depuis `version.json`.

## Verdict : accepté, prêt pour la release

- **Le correctif.** Le minuteur consomme l'instantané avant d'écrire ; `_annulerAutoSaveEnAttente()` vide minuteur et instantané, et remplace les quatre annulations. `_flusherAutoSave` vidait déjà l'instantané après l'avoir écrit : le défaut était bien le minuteur et les annulations. Lu au diff.
- **La signature de Cowork** (`dateModification` contre `heureModification`) : réfutée à raison. Retirée.
- **La liberté prise** (ajout sous X, puis retrait de l'origine ; un échec laisse un doublon, jamais une perte) : acceptée, c'est l'ordre de `deplacerCartouchesVersAutreGrille`, et c'est conforme à « on n'efface rien de façon irréversible ».

## Le stock de #1145 : mesuré, une seule évaluation

- `_autoSauvegarderCriteres` ne réécrit **jamais** une évaluation verrouillée (garde « Phase 0 A25 », lue avant le correctif sur `5f9942b0`).
- Chez Grégoire (trimestre A2026, évaluations actives) : **132 évaluations, 131 verrouillées, 1 non verrouillée** — celle de 17 h 11 (`EVAL_1792773349593_19_83234a3351c4`, Artefact 5), la seule aussi dont les critères ne sont pas ceux de sa grille (4 sur 4) ; aucune autre n'en a même un seul hors grille.
- ⮕ **Le stock est d'une évaluation, que Grégoire réévalue lui-même.** La fonction de console proposée en § 2 de la demande : **refusée** (motif : stock mesuré, un seul cas, déjà connu). Les mêmes niveaux chez trois autres élèves (septembre, 1er oct.) sont dans des évaluations verrouillées, que ce chemin ne peut pas avoir écrites : coïncidence de niveaux courants, **périmé**.

## Ensuite

La release (patch, 1.216.2), avec une ligne des Nouvelles validée par Grégoire ; puis le verdict complet et le push, à son signal. La spec `comptes-erreurs-stock-1142` reste sous surveillance (deuxième instabilité, rejouée seule verte).
