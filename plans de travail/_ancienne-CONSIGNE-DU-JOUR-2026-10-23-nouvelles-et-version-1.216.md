# Consigne du jour – la version 1.216.0 : la palette (étape 2b) et #1142 (vendredi 23 octobre 2026)

> Écrite par Cowork le vendredi 23 octobre 2026 à 10 h 36 (Toronto, mesuré par `date`), sur `main` à `603dad65` (non poussé). Elle remplace la consigne de 9 h 32, exécutée, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-23-1142-retouche-et-1143.md`. Lots relus et acceptés : l'étape 2b (`VERDICT-RELECTURE-2026-10-22-critere-algorithmique-palette.md`), #1142 et #1143 (`VERDICT-RELECTURE-2026-10-23-compte-erreurs-autre-copie.md` ; la retouche et #1143 relus par Cowork à 10 h 35 : tests seuls, aucun fichier de l'application).

## 0. Avant tout

- **Aucune suite ne tourne en arrière-plan** (ton rapport de 10 h 31 signalait trois shells encore actifs) : arrête-les ou attends-les. Une seule suite à la fois (règle 5).
- `git status` : cette consigne et son archive viennent de Cowork. Commit de docs seul, d'abord.

## 1. Les Nouvelles 1.216 (validées par Grégoire à 10 h 36, mot pour mot)

En tête de `js/changelog-data.js`, `vert`, insécables en `&nbsp;` et apostrophes courbes comme la 1.215.

- Titre : **Une palette de blocs, et le bon compte d'erreurs**
- Item 1 : Critère algorithmique : une palette de blocs nommés en mots (« Compte des erreurs », « Nom du critère »…) remplace les rangées « Poser : ». Place le curseur dans une phrase et touche un bloc : il s'y pose. Au Mac, la palette reste à côté du critère ; sur l'iPad, elle se place juste au-dessus du texte que tu écris.
- Item 2 : Correction : en passant d'une copie à l'autre en mode Évaluer, le nombre d'erreurs d'une copie pouvait s'enregistrer dans l'évaluation de la précédente, même verrouillée. Dans le PDF, la ligne du calcul pouvait alors donner un autre compte que la phrase ; la phrase, le niveau et la note restaient justes. Les évaluations déjà enregistrées gardent ce compte : si une ligne du calcul te semble fausse, écris-moi.

## 2. La version

- `node scripts/release.mjs minor --dry-run`, puis `minor` : **1.216.0**, les quatre points de vérité ; `git grep` de l'ancien build et de « 1.215.0 » hors du changelog : zéro.
- `RELAIS.md` : un bloc de tête, avec la ligne « complexité ».
- Vitest complet depuis `tests/`. **La release est le dernier commit** : la demande de relecture de la version et la ligne du plan restent hors commit, comme pour la 1.215.0.

## 3. Ce qui attend le signal de Grégoire

**Ni verdict complet ni push dans cette consigne.** Ils suivront sa ligne de signal (Chrome, Safari et Claude fermés, Mac branché).

## 4. Clôture

- Demande de relecture : `DEMANDE-RELECTURE-2026-10-23-version-1.216.0.md`, sur le modèle de celle de la 1.215.0.
- Termine par **le geste à vérifier à l'écran** après le push, et par la phrase qui dira à Grégoire comment lancer `ComptesErreurs.verifier()` une fois la 1.216.0 chargée dans son onglet.
