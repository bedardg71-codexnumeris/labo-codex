# Consigne – Des standards sans portfolio, lot 5 : l'assistant et les mots (29 octobre 2026)

> Écrite par Cowork le jeudi 29 octobre 2026 à 21 h 48 (Toronto, mesuré par `date`), sur `main` = `a283ab30`. **Passe APRÈS `CONSIGNE-LOT-2026-10-29-fenetre-de-fusion.md`** : un seul lot qui écrit à la fois (`index.html` et son bloc de jetons sont communs). Vérifie qu'aucune autre instance n'écrit dans `js/`.
> Plan : `PLAN-2026-10-28-standards-sans-portfolio.md`, § 3, lot 5. Les mots : `plans de travail/TEXTES-2026-10-29-standards-lot-5.md`, **douze textes validés par Grégoire un à un (21 h 08 à 21 h 47), à poser mot pour mot**. Règle des deux vocabulaires : Q1 (`DECISIONS-2026-10-28-construction-de-la-note.md`).

## 0. Avant tout

- Rituel de début de session ; aucune suite qui tourne.
- Commit de docs seul : ce fichier et `TEXTES-2026-10-29-standards-lot-5.md`. Pas les fichiers d'une autre instance.

## 1. Ce que l'utilisateur verra

- **Une pratique Standards sans aucun « Artefact »** : l'assistant et la fiche de la pratique (Conception › Pratiques de notation, carte « Structure des évaluations ») parlent de « productions » (« Par productions », « Les productions qui font la note », « N meilleures productions », « Nombre de productions retenues pour la note finale »…) ; le profil et le PDF écrivent « Note finale = productions retenues × 100 % » quand il n'y a pas de terminale.
- **Une pratique avec des artefacts (celle de Grégoire)** : les mots d'aujourd'hui restent, sauf les textes validés pour toutes les pratiques (5, 6, 7, 9, 11, 12 du fichier TEXTES) ; sans terminale, « portfolio × 100 % ».
- **Partout** : l'assistant ne pose plus « Utiliser un portfolio ? » ni « Nombre d'artefacts à soumettre » ; la fiche de la pratique n'affiche plus « Total d'artefacts prévus » ; le récapitulatif n'affiche plus « Artefacts à soumettre ». Aucun calcul ne les lit.
- **Aucune note ne change.** Seuls des mots et deux champs morts.

## 2. Les décisions de Cowork (techniques)

1. **Une seule règle pour la variante, une seule fonction.** « Avec artefacts » = au moins une production de type « Artefact » parmi les productions **du cours actif** (`obtenirDonneesSelonMode('productions')`, diagnostiques retirées, `poolStdFaitDArtefacts`), la même lecture que la liste du lot 4 et que le calcul. **Aucune production encore créée** : variante « productions » (un artefact en est une ; dit à Grégoire). L'assistant, la fiche de la pratique, le récit (qui a déjà `avecArtefacts`) et `obtenirTermeProduction` lisent cette fonction ; aucun ne recopie la règle. Nom et fichier à ton choix (le registre, `pratique-registre.js`, est l'endroit naturel).
2. **`obtenirTermeProduction`** (`js/profil-etudiant-helpers.js:~46`), en standards : « artefact » avec artefacts, « production » sans (les accords suivent, `_ACCORDS_TERME_PRODUCTION`). La lecture de `modalitesEvaluation.termeProduction`, qu'aucun code n'écrit, est retirée (mesure-le avant : `grep`). Le renommage de « production » est un chantier à part, inscrit par Grégoire à la page du tri : n'anticipe rien.
3. **Les champs morts : on cesse d'écrire, on n'efface pas** (le patron de `decouplerPN`, #900). « Utiliser un portfolio ? » (`portfolio.utiliser`) et le nombre à soumettre (`portfolio.nombreTotal`) sortent de l'assistant, de son récapitulatif et de sa relecture d'une pratique existante (`:~3138-3140`) ; « Total d'artefacts prévus » sort de la fiche (`index.html:~5859-5864`). Une pratique neuve ne les écrit plus ; **une pratique qui les porte les garde** quand `appliquerFormulaireDansCollection` réécrit `configuration.portfolio` (`js/pratiques-gestion.js:~1697-1704`). Remesure avant de retirer : aucun lecteur hors de ces écrans (`grep` de `nombreTotal` et de `.utiliser` ; le 29 oct., Cowork n'en a trouvé aucun ; `pratique-pan-standards.js:~537` le recopie sans le lire).
4. **La valeur stockée `approcheEvaluation: 'par-artefacts'` ne change pas** ; seul son libellé suit la variante (y compris `approcheLabels` du récapitulatif).
5. **Les textes de l'Aide sont statiques** : une seule version chacun (textes 8, 9, 11, 12), comme validé.
6. **Les libellés de la fiche** (`index.html`, statiques aujourd'hui) prennent leur variante à l'ouverture de la pratique (`remplirFormulairePratique`), là où la liste du lot 4 se remplit. Si une manière plus simple existe, prends-la et dis-la.

## 3. Où vont les douze textes

| N° | Où |
|---|---|
| 1 | Assistant, étape « Approche d'évaluation » (`js/wizard-pratique-v2.js:~597-610`) ; libellé de l'approche au récapitulatif (`:~1951`) |
| 2 | Assistant, titre et description de l'étape `config-portfolio` (`:~620-621`) |
| 3 | Modes de sélection : assistant (`:~646-648`), récapitulatif (`:~1962-1965`), fiche (`index.html:~5838-5840`) |
| 4 | Nombre retenu : assistant (`:~657`), fiche (`index.html:~5847`), récapitulatif (`:~1961`) |
| 5 | Aide de « Hybride » dans l'assistant (`:~653`) |
| 6 | Le minimum : assistant (`:~669`) et fiche (`index.html:~5855`), le même libellé (deux variantes) |
| 7 | Phrase en tête de « Structure des évaluations » (`index.html:~5825-5826`), une version |
| 8 | Aide PAN – Standards (`index.html:~10285`) et encadré « À vérifier » des Productions (`js/productions.js:~368`) |
| 9 | Aide, bloc « PAN – Standards » des familles (`index.html:~10245-10247`) |
| 10 | Récit sans terminale (`_formuleRecitStd`, `js/profil-etudiant-actions.js:~397`) : profil, PDF, Comparateur |
| 11 | Aide PAN – Standards, deux phrases sans « moyenne » (`index.html:~10285`) |
| 12 | Aide PAN – Standards, dernière phrase, le minimum (`index.html:~10285`) |

Les « % » prennent l'insécable (#1137) ; `&nbsp;` dans le HTML de l'Aide, comme autour.

## 4. Les tests

- **Avant tout commit, chercher les anciens mots dans les tests** (`tests/unit`, `tests/integration`, specs de l'Aide) : le 29 oct., six specs restées aux anciens mots du lot 5 de l'Aide ont fait rougir le premier verdict. Au moins `sentinelle-construction-de-la-note-2026-10-28.test.js:~327` (« Minimum d'artefacts avant calcul formatif ») et les sentinelles du récit (« moyenne du portfolio »).
- **Sentinelle** `sentinelle-standards-sans-portfolio`, une section neuve : CHIM (sans artefact) → chaque libellé de la variante « productions », le récit « productions retenues × 100 % » sans terminale, `obtenirTermeProduction` « production » ; GREG (artefacts) → les libellés d'aujourd'hui, sauf les textes pour toutes les pratiques, le récit « portfolio × 100 % » sans terminale, « portfolio × 60 % + terminale × 40 % » inchangé, **84,8 inchangé** ; un corpus vide → variante « productions » ; une pratique neuve par l'assistant n'écrit ni `utiliser` ni `nombreTotal` ; une pratique qui porte `nombreTotal` le garde après un enregistrement de la fiche. Les textes **lus dans le fichier TEXTES** (la forme `lire(f)` des lots 3 et 4).
- **Break-test** (arbre restauré par sha256) : la fonction de variante forcée à « artefacts » → CHIM rougit, GREG reste vert ; le récit rendu à « moyenne du … » → rougit ; le patron `decouplerPN` retiré pour `nombreTotal` → le cas « la garde » rougit.
- Vitest depuis `tests/` ; Playwright ciblé (WebKit) : l'assistant sur CHIM montre « Par productions » ; la fiche de CHIM, « N meilleures productions » ; celle de GREG, « N meilleurs artefacts ». On attend l'élément, jamais `waitForTimeout`.

## 5. Hors lot, à inscrire (pas à corriger)

- **L'Exploration des pratiques** dit encore « artefacts retenus » et « Le minimum de productions exigées change : le seuil de démonstrations à fournir avant qu'une note se construise se déplace » (faux : la note se calcule dès une copie), `js/pratiques/pratiques-exploration.js:~209-216` ; `js/pratiques/construction-attributs.js:~160-163` (« artefact(s) retenu(s) », « Sélection d'artefacts »). Mots lus par l'enseignant·e : à Grégoire, dans un lot de mots.
- **Le message du profil** « configuration de portfolio (nombre d'artefacts à retenir, minimum requis) » (`js/profil-etudiant-actions.js:~166`).
- Toute autre chaîne « artefact » d'un écran Standards que tu croises : un inventaire dans la demande, rien de plus.

## 6. Clôture

`BACKLOG.md` (#1178, lot 5 coché ; les inscriptions du § 5) ; demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-29-standards-sans-portfolio-lot-5.md` : la fonction de variante et ses lecteurs, les champs morts (avant → après d'une pratique existante), les douze textes posés (où), les tests rendus aux nouveaux mots. Un commit pour le code, un pour les docs. Pas de release, de verdict ni de push sans le signal de Grégoire ; les Nouvelles de la version lui reviendront.
