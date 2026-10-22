# Consigne du jour – le critère algorithmique, étape 2a : les trois retouches de la relecture (jeudi 22 octobre 2026)

> Écrite par Cowork le jeudi 22 octobre 2026 à 17 h 44 (Toronto, mesuré par `date`), sur `main` à `365b5364` (non poussé). Elle remplace la consigne de 17 h 05, exécutée, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-22-critere-algorithmique-noms.md`. Source : `VERDICT-RELECTURE-2026-10-22-critere-algorithmique-noms.md`, **à lire en entier d'abord** : il porte les mesures et le détail de chaque retouche.

## 0. Avant tout

- `git status` : le verdict (neuf), cette consigne et son archive viennent de Cowork. **Commit de docs seul, d'abord**, puis les retouches.
- Toujours pas de push, de verdict complet ni de release.

## 1. Retouche 1 – une marque propre aux noms (le stock de la 1.213 et de la 1.214)

La marque `codesSousCriteresSeulement` est en ligne depuis la 1.213.0 : un critère créé hier ou aujourd'hui la porte, et le lot le lit comme neuf (« 5 éléments relevés pour 400 unités »). C'est contraire à la décision 1 de Grégoire. L'erreur venait de la consigne de 17 h 05.

- `evaluation-enonces.js` : une clé neuve sur le critère (par ex. `nomsAttendus: true`) et la fonction qui la pose ; `_estNeuf`, donc `noms`, `nomsManquants` et `estNeuf`, lit cette clé, et elle seule. La forme exacte est à toi.
- `grilles.js`, `avecProjectionNeuve` : la poser au même geste et sous la même condition que `codesAnnotation.marquerNeuf`.
- Les deux schémas (`SCHEMAS_IMPORT.grille`, partage) : la clé, booléenne.
- Les bancs qui fabriquent un critère « neuf » pour les noms par `codesSousCriteresSeulement` passent à la clé neuve.
- Rien n'est écrit dans le stock.

## 2. Retouche 2 – trois surfaces que l'élève lit

1. `evaluation-retroaction.js` l. 1036, le bilan d'un critère effondré : les deux noms du critère (`algoA0.critere`), accordés par `accorder`. Même structure.
2. `evaluation-retroaction.js` l. 1109 et `synthese-retroaction-data.js` l. 903, « Tous les critères sont maîtrisés » : **décision de Grégoire, 22 oct. 2026, 17 h 43 : le participe part**, pour tous les critères. « (3 erreurs annotées) » devient « (3 erreurs) » ; avec des noms, « (3 unités manquantes) ». Les deux sites rendent les mêmes mots (le commentaire du site l. 1100 dit pourquoi). Ce qui est compté ne change pas.
3. Les trois sites passent à la règle unique du pluriel (`accorder`, le singulier sous 2), au lieu de `> 1`.
4. Mesure les bancs et specs qui figent ces phrases (« annotée », « Incomplet) ») et change-les avec la décision. ⚠ « Erreurs annotées », titre d'une section sans critère lisible (`LIBELLE_SANS_CRITERE`), n'est pas concerné : il n'y a pas de noms à y mettre.

## 3. Retouche 3 – les textes à soumettre

`TEXTES-2026-10-22-noms-critere-algorithmique.md` reçoit les phrases des trois sites (§ 1), et le refus « Un nom fait 40 caractères au plus » (`appliquerNoms`).

## 4. Les tests

- **Sentinelle S** : un critère qui porte `codesSousCriteresSeulement` sans la clé neuve, ni noms, rend les chaînes de `5bd643c3` (sauf la parenthèse) et `nomsManquants` rend `[]`. Les phrases du bilan sans noms sont celles de `5bd643c3`, sauf « annotée(s) », retiré par décision.
- **Banc D** : la rédaction et la chimie sur les trois surfaces du § 2.
- **Break-tests**, chacun nommé dans la demande : `_estNeuf` qui relit l'ancienne marque rougit S ; le site 1 remis à « erreur » en dur rougit D ; le participe remis rougit le banc des sites 2 et 3.
- Vitest depuis `tests/`, puis les specs WebKit du critère algorithmique, du PDF, et celles du § 2.4.

## 5. Clôture

- Commit sur `main`, non poussé ; une demande de relecture courte, `DEMANDE-RELECTURE-2026-10-22-critere-algorithmique-noms-retouches.md`.
- Le tableau du plan (`PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`, ligne 2) : « 2a relu, retouches commitées ».
- L'item des Nouvelles, s'il change, proposé dans ton rapport, pas écrit.
- Toute trouvaille hors du lot : les trois issues de `CLAUDE.md`, « inscrire et continuer » par défaut.
- Termine par **le geste à vérifier à l'écran**, en une phrase d'utilisateur.
