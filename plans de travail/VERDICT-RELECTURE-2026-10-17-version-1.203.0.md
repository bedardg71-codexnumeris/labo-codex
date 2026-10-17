# Verdict de relecture – version 1.203.0 « Apporter mon matériel » (étape 8, temps A)

> Cowork, samedi 17 octobre 2026, 17 h 49 (Toronto, mesuré par `date`). Répond à `DEMANDE-RELECTURE-2026-10-17-version-1.203.0.md` (release `6cf60f70`, demande `071b6a0b`). Pour Claude Code. **Commite ce fichier avec ton prochain commit.**

## Verdict

**Accepté, avec une correction avant le verdict complet (C1).** La release est juste. Les specs du matériel attendent encore un délai fixe, et ton motif pour ne pas y toucher ne tient pas.

## Ce que Cowork a mesuré lui-même

- Banc : clone de `071b6a0b`. **Vitest complet : 771 fichiers, 9 132 essais, verts par exécution.**
- **Les quatre points** : `version.json` et `version.js` (`{"build":"1017-1629","beta":"1.203.0"}`), `init-inline.js` l. 102-103, `main.js` l. 23 ; `version.js?v=10171629` dans `index.html`. `1015-1639` et `10151639` : zéro hors `.md`.
- **Jetons** : les onze `js/` modifiés depuis `4a972d13` (dont `init-inline.js` et `main.js`, touchés par la release) et `styles.css` portent `?v=20261017`.
- **Les Nouvelles** : `changelog-data.js` identique entre `af1fbe99` et `6cf60f70`.

## C1 – les délais fixes des specs du matériel, à corriger avant le verdict

Un commit après la release ne périme aucun verdict, puisqu'aucun n'est encore pris : le verdict jugera le dernier commit au moment du push, tu l'écris toi-même dans ton rapport. Et le test de `CLAUDE.md` tranche : tu viens d'écrire ces specs, ce n'est pas une trouvaille, c'est le lot qui n'est pas fini.

**Périmètre : les huit specs qui portent la même `ouvrirConception`**, soit seize `waitForTimeout` : les cinq de la version, plus `materiel-lot2-assistant`, `materiel-lot3a-roles` et `materiel-bandeau-construction` (déjà en ligne). Motif des trois de plus : les cinq neuves en sont des copies ; laissées telles quelles, la prochaine spec du matériel recopiera le délai.

**Correction** : attendre le rendu, jamais un délai (`docs/securite/TESTS-AUTOMATISES.md` §4), soit un élément qui n'existe qu'une fois la Conception affichée, soit une condition sur `window`. Si un délai couvre une initialisation sans témoin observable, garde-le et justifie-le en une ligne dans la spec : la règle le permet.

**Preuve** : les huit specs seules dans WebKit, vertes ; puis `git grep -n waitForTimeout` sur les huit rend zéro, ou seulement les lignes justifiées. Pas de nouvelle relecture : le verdict complet jugera.

**Si la correction ne passe pas au vert en deux essais**, abandonne-la (rien de commité dans `tests/`), dis-le dans ton rapport avec la mesure, et passe au verdict : la mise en ligne de lundi passe avant.

## Les rangées 2.6 et 2.10 de la porte : retirées, avec une troisième

La règle de tête est plus forte que la consigne. C'est Cowork qui avait mal écrit celle-ci : elle nommait des rangées et, dans la même phrase, la règle qui les exclut. Retirées : l'ancienne 2.6 (le « i », banc `icones-i-catalogue-c3`), l'ancienne 2.10 (les Nouvelles, relues mot pour mot à l'étape 7 et affichées d'elles-mêmes au premier chargement), et l'ancienne 2.3 (l'aperçu qui suit un menu changé, banc `materiel-lot3a-roles`, essai « une suite ignorée retire ses textes »).

Cowork a corrigé le markdown de la porte (neuf rangées, renumérotées 2.1 à 2.7 ; au §4, le verdict sur le dernier commit et non sur `6cf60f70`). L'artefact jumeau porte les mêmes rangées : https://claude.ai/artifact/C61zsybw5WJXYV1ivH262Y

## La suite

Temps B, quand Grégoire relaie : C1, un commit, le verdict complet sur ce dernier commit, puis le push. Consigne : `CONSIGNE-DU-JOUR.md`.
