# Consigne du jour – la version 1.216.2 : #1145 dans les Nouvelles (vendredi 23 octobre 2026)

> Écrite par Cowork le vendredi 23 octobre 2026 à 18 h 18 (Toronto, mesuré par `date`), sur `main` à `7500ebc9` (non poussé ; en ligne : la 1.216.1, `aaaa80b5`). Elle remplace la consigne de 17 h 31 (#1145), exécutée, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-23-1145-evaluer-reecrit.md`. #1145 relu et accepté : `VERDICT-RELECTURE-2026-10-23-1145-evaluer-reecrit.md`.

## 0. Avant tout

- Aucune suite ne tourne en arrière-plan (règle 5).
- Un commit de docs seul, fichiers nommés : cette consigne, son archive, le verdict de #1145.

## 1. SUIVI-BUGS, #1145

Ajoute le stock mesuré par Cowork (verdict, § « Le stock ») : une seule évaluation réécrite, celle de 17 h 11, que Grégoire réévalue ; la fonction de console refusée (motif : un seul cas, connu) ; les mêmes niveaux chez trois autres élèves, périmé (évaluations verrouillées).

## 2. Les Nouvelles 1.216 : un quatrième item (validé par Grégoire à 18 h 17, mot pour mot)

Dans l'entrée `1.216` existante de `js/changelog-data.js`, après les trois items ; insécables en `&nbsp;` et apostrophes courbes comme les autres ; titre et couleur inchangés ; commentaire de tête mis à jour (#1145, validation de 18 h 17).

> Correction : passer en mode Évaluer pouvait réécrire une évaluation non verrouillée avec des niveaux posés plus tôt sur cette copie, sans « Enregistrer ». Les évaluations verrouillées n'étaient pas touchées.

## 3. La version

- `node scripts/release.mjs patch --dry-run`, puis `patch` : **1.216.2**, les quatre points de vérité ; `git grep` de l'ancien build `1023-1402`, de son jeton et de « 1.216.1 » hors `*.md` : zéro.
- `RELAIS.md` : un bloc de tête, avec la ligne « complexité » (par rapport à la 1.216.1 en ligne, `aaaa80b5`).
- Vitest complet depuis `tests/`. **La release est le dernier commit** : la demande de relecture reste hors commit.

## 4. Clôture

- **Ni verdict complet ni push** : ils suivront la relecture de Cowork et le signal de Grégoire.
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-23-version-1.216.2.md`.
- Termine par le geste à vérifier à l'écran de ton rapport de 18 h, et par ce que Grégoire fera ensuite (l'Artefact 5 sur G4H, le codex à jour, les deux réparations de console après lecture des mesures, la copie de 17 h 11 réévaluée).
