# Consigne – Les calculs, lot 4a : les trois calculs tout faits, dits en mots et en blocs (étape 4 du plan du 21 oct.)

> Écrite par Cowork le mardi 27 octobre 2026 à 06 h 33 (Toronto, mesuré par `date`), sur `main` = `99ac1eaf` (#1172 accepté sans retouche, le tri de Git fusionné ; rien de poussé). Plan : `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`, étape 4. Textes validés par Grégoire le 26 oct. à 20 h 53 : `TEXTES-2026-10-26-calculs-tout-faits.md`. Ébauche validée le 26 oct. à 21 h 10 : `EBAUCHE-2026-10-26-calculs.html`.
> **L'ébauche fait foi pour ce que l'enseignant·e voit.** Relis dans son script `TOUT_FAITS`, `nomDonnee`, `nomParam`, `ISSUES`, `evaluer`, `resultatCalcul`, `enChiffres`, `chipJeton`, `formuleEnBlocs`, `casDunCalcul`, `texteResultat`, `carteCalcul`, et l'encadré « sept points » en tête.
> **Découpage décidé par Cowork.** L'étape 4 est la seule qui touche le calcul d'une note : elle passe en deux lots. **4a (ce lot)** : les trois calculs tout faits s'écrivent en blocs, une seule source les calcule et les dit, et l'enseignant·e dit ce que vaut la note quand une donnée de la copie vaut 0. **4b (consigne à venir)** : « Retoucher ce calcul », « Composer ton propre calcul », un calcul qui sert aux phrases et aux tables.

## 0. Avant tout

- Un seul lot à la fois : sur un `main` à jour, aucune suite qui tourne. Les documents non commités de Cowork dans le dossier ne sont pas un obstacle : ils ne sont pas à toi.
- Rituel de début de session.
- Un commit de docs seul, fichiers nommés : ce fichier, `TEXTES-2026-10-26-calculs-tout-faits.md`, `EBAUCHE-2026-10-26-calculs.html`, le plan (ses lignes modifiées), `VERDICT-RELECTURE-2026-10-26-chaine-carte-alignement.md`. Pas `CONSIGNE-DEMARRAGE-COWORK.md`.
- #1172 et le tri de Git sont sur `main`, non poussés : ce lot part de là, tout partira ensemble au prochain verdict, au signal de Grégoire.

## 1. Les principes

1. **Une note enregistrée garde sa valeur.** Un critère dont l'enseignant·e ne touche rien calcule exactement ce qu'il calcule aujourd'hui. Le relevé du lot 3a (`tests/fixtures/table-de-cas-3a-avant.json`) reste vert à l'octet ; ce qu'une évaluation enregistre ne change pas de forme.
2. **Une seule source.** Les blocs d'un calcul (ses jetons) le définissent : la note, la ligne en blocs du gabarit et la ligne chiffrée de l'évaluation en sortent toutes. C'est le principe de #667 (`evaluation-formules.js`, en tête), poussé d'un cran. Aucune expression interprétée : ni `eval`, ni `new Function` (CSP).
3. **Aucune discipline dans `js/`.** Banc dans les deux disciplines fictives de l'ébauche (« erreurs » sur « mots » ; « unités manquantes » sur « calculs »). Les identifiants de données (`ponderation`, `compte`, `comptePondere`, `etendue`) n'en nomment aucune.
4. Les mots d'écran : ceux de l'ébauche et des textes validés, au mot près ; les deux noms de l'enseignant·e partout où l'on parlait d'« erreurs » et de « mots » ; présent pour ce que le critère fait, conditionnel pour la copie fictive ; « étudiant·e ».

## 2. Ce que l'enseignant·e voit, en gestes (l'ébauche fait foi)

- **Étape « Note calculée »** : la phrase d'ouverture, puis « Le calcul de la note » et trois cartes à bouton radio, dans l'ordre de l'ébauche : « Pénalité proportionnelle à la longueur », « Rapport visé », « Pénalité fixe », chacune avec son texte validé. La carte choisie montre son réglage (les libellés de `libelleParam`, avec les noms de l'enseignant·e), « Le calcul, en blocs : » (la ligne de pastilles de `formuleEnBlocs`), « Sur la copie fictive : … » (la copie de la simulation du lot 3a), puis « Quand une donnée de la copie vaut 0 » (`casDunCalcul`).
- **Quand une donnée vaut 0** : une rangée par donnée du calcul, « Si [donnée] vaut 0 » et un menu : « Calculer normalement », « Aucune note : l'évaluation attend [la donnée] », « La note entière », « Une note de 0 ». **Jamais « Calculer normalement » pour une donnée par laquelle on divise.** Sous les rangées, si le calcul divise : « Une division par une donnée qui vaut 0 n'a pas de résultat : tu dis ce que vaut alors la note. »
- **Sous les cartes** : « La note reste entre 0 et la pondération du critère. » La seconde phrase de l'ébauche (« Comme aujourd'hui, une copie déjà évaluée garde sa note ; elle suit le nouveau calcul dès que tu la modifies. ») **seulement si la mesure du piège 2 la confirme**.
- **La chaîne d'étapes** : l'info « pénalité proportionnelle », « rapport visé » ou « pénalité fixe » ; le résumé « Pénalité fixe, sur 20 ».
- **À l'évaluation** : la ligne chiffrée suit les blocs (`enChiffres`), au présent : « Note = 20 − 3 × 2 = 14 / 20 » ; au-delà des bornes, « … ; la note s'arrête à la pondération : 20 / 20 » ou « … ; la note ne descend pas sous 0 : 0 / 20 » ; une donnée à 0 : « [La donnée] vaut 0 : la note est entière, 20 / 20. », « … : la note est 0 / 20. », ou la ligne masquée quand aucune note ne se calcule (comme aujourd'hui).
- **L'Aide** : l'entrée « Les critères algorithmiques » (`accordeon-aide-sous-criteres`, `index.html` l. ~10764-10770) prend les trois noms et les trois textes validés, et dit qu'on choisit le calcul dans l'étape « Note calculée ». Rien d'autre de l'Aide : sa refonte suit.
- **Pas dans ce lot** : « Retoucher ce calcul » et « Composer ton propre calcul » (4b).

## 3. Décidé par Cowork (si la mesure le contredit, dis-le plutôt que de le suivre)

1. **Les jetons dans `evaluation-formules.js`** : chaque modèle déclare les siens, comme `TOUT_FAITS` de l'ébauche. Les identifiants enregistrés ne changent pas : `penalite_normalisee`, `ratio_cible`, `penalite_par_erreur`, et leurs paramètres `facteurNormalisation`, `motsParErreurCible`, `pointsParErreur` (les clés `longueur`, `rapport`, `points` de l'ébauche sont des noms d'affichage). Leurs bornes `min` et `max` non plus.
2. **Un seul évaluateur, pur** (l'algorithme de `evaluer` de l'ébauche : priorités usuelles, parenthèses ; rend une valeur, une erreur ou la donnée qui divise par 0). Le `calculer` de chaque modèle devient l'évaluation de ses jetons ; les anciens corps sont retirés, et ne survivent que comme référence dans le banc d'équivalence. Emplacement : `evaluation-formules.js`, ou un module pur à part s'il dépasse ~150 lignes ; à toi de voir.
3. **Le banc d'équivalence** : sur une grille de valeurs (pondérations 1, 20, 30, 100 ; comptes pondérés 0 à 60, dont 0,5 et 2,5 ; étendues 0, 1, 12, 60, 500, 600, 10 000 ; chaque paramètre à son défaut, à son `min` et à son `max`), l'ancien et le nouveau calcul rendent le même `applicable` et la même `raison`, une note à 1e-9 près, et **le même niveau** par `niveauDuPourcentage` sur une échelle IDME standard. Break-test.
4. **Ce que vaut la note quand une donnée vaut 0 : `critere.casZero`**, absent tant que l'enseignant·e garde les choix de départ. Forme : `{ <modèle>: { <donnée>: 'calcul' | 'aucune' | 'entiere' | 'zero' } }`, une entrée seulement là où le choix diffère du départ. **Les départs sont le comportement d'aujourd'hui** : `penalite_normalisee` `{ etendue: 'aucune', comptePondere: 'calcul' }` ; `ratio_cible` `{ etendue: 'aucune', comptePondere: 'entiere' }` ; `penalite_par_erreur` `{ comptePondere: 'calcul' }`. Ordre d'examen : l'étendue, puis le compte, puis le compte pondéré (celui de `resultatCalcul`). `'calcul'` sur une donnée qui divise est illisible : écarté, on revient au départ. `'aucune'` rend `applicable: false` ; garde `raison: 'mots-absents'` pour l'étendue, puisque c'est la même situation qu'aujourd'hui.
5. **Les données** : `comptePondere` est ce que `calculer` reçoit aujourd'hui sous le nom `erreurs` (la somme pondérée, dans les deux modes : mesure-le) ; `etendue`, ce qu'il reçoit sous `mots` ; `compte`, le compte brut, déclaré pour 4b et lu par aucun des trois. `utiliseMots` se déduit des jetons (ils contiennent l'étendue) : ses consommateurs (`evaluation-projection.js` l. ~685, la garde de `evaluation-calcul.js` l. ~950) ne changent pas de comportement.
6. **Les textes engendrés** : `libelleChiffre` sort des jetons, aux noms de l'enseignant·e (`enoncesAlgo.noms`) ; le gabarit montre les pastilles à la place de « Formule appliquée ». `libelleSymbolique` : garde-le s'il a encore un lecteur, retire-le sinon (zéro dette). Les noms courts de `atelier-algo.js` (`FORMULES_COURTES`) et les mentions de `miroir-algo.js` suivent.
7. **Ce qui s'enregistre à l'évaluation ne change pas** (`noteCalculee` brute, `pourcentage` borné, `niveau`, `sommePonderee` seulement quand elle diffère) : ce lot change le calcul et ce qu'on lit, pas la forme des données.

## 4. Le transport (mesuré par Cowork en lecture, à revérifier)

- `casZero` voyage avec le critère, comme `tablesCas` au lot 3b. **Import** : le schéma du critère, à côté de `modeleFormule` et `paramsFormule` (`js/import-export.js` l. ~925-935) ; une entrée illisible (modèle, donnée ou choix inconnus, `'calcul'` sur une donnée qui divise) est écartée, jamais devinée. **Partage** : `js/partage-schemas.js` l. ~233 ; même règle que `tablesCas` (la structure illisible est refusée). **Export, codex, archives, copie de grille, bibliothèque** : mesure par `grep` que chacun copie le critère entier, ou dis lequel ne le fait pas.

## 5. Où (mesuré par Cowork en lecture, à revérifier)

`js/evaluation-formules.js` ; `js/evaluation-calcul.js` (`_calculerScoreAlgoCategories` l. ~645, `calculerNoteAlgorithmiqueSimple` l. ~950-980, `_afficherFormuleAlgo` l. ~510) ; `js/grilles.js` (`rendreBlocFormuleAlgo` l. ~3653, `rendreCartesGabaritAlgo` l. ~5410, les gestionnaires l. ~5436-5467 et ~7052-7080) ; `js/main.js` (le dispatcher, pour le menu « vaut 0 ») ; `js/atelier-algo.js` (`FORMULES_COURTES`, `_etapeNote`, `TEXTES`) ; `js/miroir-algo.js` ; `js/tables-cas-algo.js` (la valeur « note ») ; `js/evaluation-retroaction.js` (`_detecterAlgoA0Bilan`) ; `js/comptes-erreurs-stock.js` (la réparation de #1142 calcule par `formulesAlgo.calculer`) ; `js/import-export.js` ; `js/partage-schemas.js` ; `styles.css` (pastilles et cartes de l'ébauche, ramenées au `design-system.html`) ; `index.html` (l'entrée de l'Aide, les jetons de cache) ; `tests/unit/sentinelle-667-formule-livree-par-le-gabarit.test.js`.

## 6. Pièges connus

1. **Le stock** : le relevé du lot 3a vert à l'octet ; ouvrir une évaluation n'écrit rien ; la réparation de #1142 rend le même résultat qu'avant le lot (couvert par l'équivalence, à vérifier sur son propre banc).
2. **À mesurer, sans rien changer** : une grille déjà employée, on change le calcul d'un critère. (a) Les évaluations enregistrées sont-elles identiques en base, avant et après ? (b) On rouvre une copie verrouillée : quelle note l'écran montre-t-il, l'enregistrée ou la recalculée ? Quelque chose s'écrit-il sans geste ? (c) Même question pour une copie déverrouillée. Écris la réponse dans la demande de relecture. **La phrase « Comme aujourd'hui, une copie déjà évaluée garde sa note ; elle suit le nouveau calcul dès que tu la modifies » ne se pose que si (a), (b) et (c) la confirment.** Sinon, ne la pose pas et dis ce qui est vrai : ce que veut dire une note revient à Grégoire, Cowork lui proposera un texte.
3. **La virgule flottante** : l'ordre des opérations change pour le rapport visé (`20 × (600 ÷ 12) ÷ 60` au lieu de `20 × min(1 ; (600 ÷ 12) ÷ 60)`). Le banc du § 3.3 le couvre ; le niveau doit être identique, pas seulement la note.
4. **« Aucune note »** suit le chemin d'aujourd'hui (`_viderResultatAlgoSimple`) : le niveau est retiré, jamais « -- » (#702).
5. Deux critères algorithmiques dans une grille : chacun son calcul et son `casZero`.
6. Le redessin du gabarit : changer de carte, taper un réglage ou choisir dans un menu « vaut 0 » ne fait sauter ni le focus ni le défilement (même exigence qu'au lot 3b).
7. Règles 1, 2 et 4 de `CLAUDE.md` : les noms de l'enseignant·e par `textContent` ou `echapperHtml` ; aucun gestionnaire en ligne ; aucun `console.log`. Aucun nom d'élève réel.
8. Le mode Catégories (#1133, sans écran) passe par le même `calculer` : l'équivalence le couvre, rien d'autre à faire.

## 7. Preuve exigée

- **Vitest** : l'évaluateur (priorités, parenthèses, jetons mal formés, division par une donnée nulle, par un nombre nul) ; le banc d'équivalence du § 3.3 ; chaque choix « vaut 0 », pour chaque modèle et chaque donnée, et les départs égaux au comportement d'aujourd'hui ; `casZero` illisible écarté ; l'aller-retour export → import et partage → réception ; la ligne chiffrée et les pastilles dans les deux disciplines. Break-test pour chacun.
- **Playwright (WebKit)** : choisir chacune des trois cartes, taper son réglage, changer un menu « vaut 0 » et voir la copie fictive suivre ; **une vraie copie évaluée** en mode simple, codes posés dans Annoter, en pénalité fixe : sa note et sa ligne chiffrée ; une étendue à 0 avec « Une note de 0 », puis avec « Aucune note » ; la mesure du piège 2 ; 1 440, 1 180, 820 et 700 px.
- **Captures** : 1 440 et 820 px, clair et sombre, l'étape « Note calculée » dans les deux disciplines.
- Portes terrain : skill `portes-terrain`, ses deux règles de tête d'abord.

## 8. Ce qui n'entre pas

« Retoucher ce calcul », « Composer ton propre calcul » et un calcul pour les phrases ou les tables (4b) ; la forme de ce qui s'enregistre ; un écran pour le mode Catégories ; l'Aide au-delà de l'entrée nommée ; le code mort `calculerNoteAlgorithmique` (`evaluation-calcul.js` l. ~98), qui n'est pas à ce lot.

## 9. Clôture

- Le plan du 21 oct. : la ligne de l'étape 4 dit « 4a fait », avec ses commits.
- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-27-calculs-4a.md`, la mesure du piège 2 en tête.
- Pas de release, de verdict ni de push sans le signal de Grégoire.
