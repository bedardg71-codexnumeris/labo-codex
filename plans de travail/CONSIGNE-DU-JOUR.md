# Consigne du jour – la version 1.216.1 : #1144 dans les Nouvelles (vendredi 23 octobre 2026)

> Écrite par Cowork le vendredi 23 octobre 2026 à 13 h 59 (Toronto, mesuré par `date`), sur `main` à `e088aa6c` (non poussé ; en ligne : la 1.215.0). Elle remplace la consigne de 13 h 27 (#1144), exécutée, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-23-1144-cartouche-criteres.md`. #1144 relu et accepté : `VERDICT-RELECTURE-2026-10-23-1144-cartouche-criteres.md`.

## 0. Avant tout

- Aucune suite ne tourne en arrière-plan (règle 5).
- Un commit de docs seul, fichiers nommés : cette consigne, son archive, le verdict de #1144.

## 1. SUIVI-BUGS, #1144

Ajoute à la fiche les deux faits du verdict (§ « Deux faits nouveaux ») : la cartouche du plan de rédaction écrite, même id, sous une seconde grille sans remappage ni retrait de la source ; les critères de G5M recréés vers le 2 sept. après la naissance de la cartouche de rédaction. La fiche reste ouverte pour la source (issue 2).

## 2. Les Nouvelles 1.216 : un troisième item (validé par Grégoire à 13 h 59, mot pour mot)

Dans l'entrée `1.216` existante de `js/changelog-data.js` (une entrée par version mineure : on consolide le patch), après les deux items, insécables en `&nbsp;` et apostrophes courbes comme les deux autres. Titre et couleur inchangés.

> Correction : à l'évaluation, une cartouche faite pour une autre grille pouvait remplacer à l'écran les critères de la grille choisie (pondérations en « ? », un critère disparu). L'écran montre maintenant toujours les critères de la grille, et une ligne nomme ceux que la cartouche ne commente pas. Si cette ligne apparaît avec une cartouche qui devrait tout couvrir, écris-moi.

Mets à jour le commentaire de tête de l'entrée (#1144, validation de 13 h 59). Profites-en pour rendre son espace au commentaire de la 1.215 (`// 1.215(le` → `// 1.215 (le`), trouvaille de la relecture de 10 h 52.

## 3. La version

- `node scripts/release.mjs patch --dry-run`, puis `patch` : **1.216.1**, les quatre points de vérité ; `git grep` de l'ancien build `1023-1037`, de son jeton et de « 1.216.0 » hors `*.md` : zéro.
- `RELAIS.md` : un bloc de tête, avec la ligne « complexité » (par rapport à la 1.215.0 en ligne, `628a7657`).
- Vitest complet depuis `tests/`. **La release est le dernier commit** : la demande de relecture reste hors commit.

## 4. Clôture

- **Ni verdict complet ni push** : ils suivront la relecture de Cowork et le signal de Grégoire.
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-23-version-1.216.1.md`.
- Termine par le geste à vérifier à l'écran après le push (les Nouvelles, la palette, le compte d'erreurs, les cinq critères de G5H avec la cartouche du plan) et par les deux commandes de console (`ComptesErreurs.verifier()`, `CartouchesDecalees.verifier()`).
