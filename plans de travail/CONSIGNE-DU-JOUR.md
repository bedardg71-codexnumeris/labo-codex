# Consigne du jour – les textes de l'étape 2a et la version 1.215.0 (jeudi 22 octobre 2026)

> Écrite par Cowork le jeudi 22 octobre 2026 à 18 h 31 (Toronto, mesuré par `date`), sur `main` à `efad6af1` (non poussé). Elle remplace la consigne des retouches (17 h 44), exécutée, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-22-critere-algorithmique-noms-retouches.md`. Sources : `VERDICT-RELECTURE-2026-10-22-critere-algorithmique-noms.md` (les retouches, acceptées à 18 h 22) et la section « Validation » de `TEXTES-2026-10-22-noms-critere-algorithmique.md`.

## 0. Avant tout

- `git status` : le verdict, `TEXTES-2026-10-22-noms-critere-algorithmique.md`, cette consigne et son archive viennent de Cowork. **Commit de docs seul, d'abord.**
- Le commit d'un lot n'ajoute que ses propres fichiers (remarque du verdict : `efad6af1` a embarqué treize documents d'autres jours).

## 1. Les textes (décisions du 22 oct.)

1. **Décision de Grégoire, 18 h 29** : le repli de ce à quoi on rapporte le compte devient « élément examiné » / « éléments examinés » (`NOMS_PROVISOIRES.mots`, à la place de « unité » / « unités »). L'élève d'un critère neuf évalué sans noms lit : « Ta production contient 5 éléments relevés pour 12 éléments examinés. » L'invitation d'Annoter suit d'elle-même.
2. **Tranché par Cowork** : les aides des deux repères (`REPERES`) perdent leur exemple de rédaction.
   - `{nomErreurs}` : « Le nom de ce que tu comptes, écrit sous le critère : au singulier sous 2, au pluriel à partir de 2. »
   - `{nomMots}` : « Le nom de ce à quoi tu rapportes le compte, écrit sous le critère : au singulier sous 2, au pluriel à partir de 2. »
3. Les commentaires « provisoire » de ces textes et des autres textes de l'étape 2a partent : tous sont validés. Les bancs qui lisent `TEXTES-…` et ceux qui figent « unité » suivent.

## 2. Les Nouvelles 1.215 (validées par Grégoire à 18 h 31, mot pour mot)

En tête de `js/changelog-data.js`, `vert`, insécables en `&nbsp;` comme la 1.214.

- Titre : **Nommer ce que tu comptes**
- Item 1 : Critère algorithmique : tu nommes ce que tu comptes et ce à quoi tu le rapportes, au singulier et au pluriel (par ex. « unité manquante » sur des « calculs »). Ces noms s'écrivent dans les champs de l'évaluation, dans la phrase de l'élève et dans son PDF. « Partir de la liste du français écrit » pose « erreur » et « mot ». Un critère créé avant garde « erreur » et « mot ».
- Item 2 : Ce que lit l'élève s'accorde maintenant avec n'importe quel nom : « 5 erreurs (3,5 après pondération) sur 400 mots ». Quand tous les critères sont maîtrisés, le bilan dit « (3 erreurs) » plutôt que « (3 erreurs annotées) ».

## 3. La version

- `node scripts/release.mjs minor --dry-run`, puis `minor` : **1.215.0**, les quatre points de vérité. `git grep` de l'ancien build et de « 1.214.0 » : zéro.
- `RELAIS.md` : un bloc de tête, avec la ligne « complexité » (le compte des fonctions trop complexes est descendu de 454 à 453 en `efad6af1`).
- **Ni verdict complet, ni push** : au signal de Grégoire, en fin de journée.

## 4. Tests

Vitest depuis `tests/`, complet. Les specs WebKit du critère algorithmique et du PDF. Pas de break-test : textes et version seulement.

## 5. Clôture

- Commit(s) sur `main`, non poussés.
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-22-version-1.215.0.md`, sur le modèle de celle de la 1.214.0.
- Le tableau du plan, ligne 2 : « 2a relu, textes validés, version 1.215.0 prête ; 2b à faire ».
- Termine par **le geste à vérifier à l'écran**, en une phrase d'utilisateur, à faire après le push.
