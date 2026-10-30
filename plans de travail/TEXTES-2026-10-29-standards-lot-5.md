# Textes – Des standards sans portfolio, lot 5 : l'assistant et les mots (#1178)

> **Tous validés par Grégoire le 29 oct. 2026, de 21 h 08 à 21 h 47. À intégrer mot pour mot.** Proposés par Cowork le 29 oct. 2026 (à partir de 14 h 10), **un par tour**, à valider par Grégoire avant la consigne. Plan : `PLAN-2026-10-28-standards-sans-portfolio.md`, § 3, lot 5, et § 4. Règle des mots : Q1 (`DECISIONS-2026-10-28-construction-de-la-note.md`) : avec au moins un « Artefact », « portfolio » et « artefact » ; sans, « productions ».

## Décisions de Cowork (techniques, dites à Grégoire en une ligne)

- **La variante se choisit sur les productions du cours actif**, la source du calcul (`obtenirDonneesSelonMode('productions')`, comme la liste du lot 4). **Sans aucune production encore créée**, l'assistant dit « productions » : un artefact en est une, la phrase reste vraie. Conséquence acceptée : une pratique créée en début de trimestre, avant les artefacts, voit la variante « productions ».
- **Avec un « Artefact », les mots d'aujourd'hui restent**, sauf ceux qui sont faux pour toute pratique (signalés plus bas).
- **Les champs sans lecteur sortent** (zéro dette ; la clé stockée reste, sans lecteur, famille de #903) : « Utiliser un portfolio ? » (`utiliser`) ; « Nombre d'artefacts à soumettre » de l'assistant, « Total d'artefacts prévus » de la fiche de la pratique et « Artefacts à soumettre » du récapitulatif (`nombreTotal` : aucun calcul ne le lit, remesuré le 29 oct. par `grep`).
- **La valeur stockée `approcheEvaluation: 'par-artefacts'` ne change pas** : seul le libellé suit la variante.

## 1. L'écran « Approche d'évaluation » de l'assistant

✅ **Validé par Grégoire le 29 oct. 2026 à 21 h 08** (« oui »). (`js/wizard-pratique-v2.js:~597-610`, et le libellé du récapitulatif, `:~1951`).

Avec un « Artefact » : inchangé (« Par artefacts (portfolio) » ; « Les étudiant·es soumettent des artefacts. La note finale est calculée à partir des N meilleurs artefacts. » ; « PAN-Standards s'appuie sur le portfolio : c'est la progression à travers les artefacts qui construit la note. »).

Sans « Artefact » :

La carte :
> Par productions

Sa description :
> La note se calcule à partir de tes productions évaluées, sauf les diagnostiques.

L'information sous la carte :
> En PAN – Standards, la note repose sur plusieurs productions : à l'étape suivante, tu choisis lesquelles elle retient (les meilleures, les dernières ou toutes).

## 2. Le titre de l'étape suivante de l'assistant

✅ **Validé par Grégoire le 29 oct. 2026 à 21 h 09** (« on garde »). (`js/wizard-pratique-v2.js:~620-621`). Avec un « Artefact » : inchangé (« Configuration du portfolio » ; « Paramètre la gestion des artefacts »). Les champs « Utiliser un portfolio ? » et « Nombre d'artefacts à soumettre » quittent cette étape (décision de Cowork, ci-dessus), dans les deux variantes.

Sans « Artefact », le titre :
> Les productions qui font la note

Sa description :
> Choisis combien en retenir, et lesquelles.

## 3. Les modes de sélection (« Construction de la note »)

✅ **Validé par Grégoire le 29 oct. 2026 à 21 h 11** (« oui »), après sa remarque de 21 h 10 : « production » ne convient pas tout à fait à un stage ou à un laboratoire. Décidé avec lui : le mot reste dans ce lot, parce qu'il nomme l'écran « Productions » où l'enseignant·e crée ces objets ; un autre mot dans ces seuls libellés donnerait deux noms au même objet. Le renommage (« activité », envisagé par Grégoire le 19 oct.) est un chantier à part, inscrit à la page du tri : partout à la fois, ou nulle part. Trois endroits, les mêmes mots : l'assistant (`js/wizard-pratique-v2.js:~646-649`), son récapitulatif (`:~1962-1966`) et la fiche de la pratique (Conception › Pratiques de notation, carte « Structure des évaluations », `index.html:~5838-5841`, « Mode de sélection »). Avec un « Artefact » : inchangés. « Hybride (N meilleures + Obligatoires) » ne change dans aucune variante.

Sans « Artefact » :
> N meilleures productions

> Toutes les productions

> N dernières productions

## 4. Le nombre retenu

✅ **Validé par Grégoire le 29 oct. 2026 à 21 h 38** (« ok »). Avec un « Artefact » : inchangés.

| Où | Aujourd'hui | Sans « Artefact » |
|---|---|---|
| Assistant (`js/wizard-pratique-v2.js:~657`) | Nombre d'artefacts retenus pour la note finale | Nombre de productions retenues pour la note finale |
| Fiche de la pratique (`index.html:~5847`) | Artefacts pour la note finale | Productions pour la note finale |
| Récapitulatif de l'assistant (`:~1961`) | Artefacts retenus | Productions retenues |

> **Vocabulaire (Grégoire, 29 oct., 21 h 38) : il n'y a pas de « Mode expert ».** L'écran visé par le plan sous ce nom est la fiche de la pratique : Conception › Pratiques de notation, carte « Structure des évaluations » (l'application y mène par « Réglages de la pratique »). Le « mode expert » n'est pas un écran : c'est l'interface où l'on arrive en activant des options (sa décision du 28 oct.).

## 5. L'aide de « Hybride » dans l'assistant

✅ **Validé par Grégoire le 29 oct. 2026 à 21 h 39** (« on garde »). `js/wizard-pratique-v2.js:~653`. Aujourd'hui : « Hybride : combine N meilleures productions + productions obligatoires (ex: examen final). Configuration détaillée en Mode Expert. » Faux : il n'y a pas de Mode expert ; les obligatoires se désignent dans la fiche de la pratique (`mat-config-categories`). Une seule version, avec ou sans artefact (le texte dit déjà « productions »).

> Hybride : combine les N meilleures productions et les productions obligatoires (par exemple, un examen final). Une fois la pratique créée, tu choisis lesquelles sont obligatoires dans Conception › Pratiques de notation.

## 6. Le minimum d'évaluations

✅ **Validé par Grégoire le 29 oct. 2026 à 21 h 40** (« on garde »). Un même réglage (`portfolio.minimumCompletion`) porte deux noms : « Minimum d'artefacts avant calcul formatif » dans l'assistant (`js/wizard-pratique-v2.js:~669`) et « Nb minimal d'évaluations pour P et E » dans la fiche de la pratique (`index.html:~5856`). Le premier est faux : la note se calcule dès une copie (E9, STD-9).

Ce qu'il règle, mesuré le 29 oct. (lecture du code) : sous ce nombre d'évaluations, la carte Performance du profil affiche « — » et dit « Minimum N évaluations requises (x/N complétées) » (`profil-etudiant-sections-affichage.js:~172, ~473, ~699`) ; la liste des étudiant·es marque l'élève sous « ≥ Min. » et l'écarte de la moyenne P (`etudiants.js:~942`, « au moins N évaluations pour qu'un P soit fiable ») ; l'aperçu du tableau de bord compte les évaluations en attente (`tableau-bord-apercu.js:~1644`). Le plafonnement de conformité le lit aussi, quand il est activé (ce que l'assistant ne fait pas). La note finale, elle, se calcule.

Proposé, le même libellé aux deux endroits :

Avec un « Artefact » :
> Minimum d'artefacts évalués pour un indice P fiable

Sans « Artefact » :
> Minimum de productions évaluées pour un indice P fiable

## 7. La phrase en tête de « Structure des évaluations » (fiche de la pratique)

✅ **Validé par Grégoire le 29 oct. 2026 à 21 h 42** (« on garde »). (`index.html:~5825-5826`). Aujourd'hui, faux pour toute pratique : « PAN-Standards : Évaluation par niveaux de maîtrise (ex: IDME). Le meilleur résultat est retenu pour chaque standard ou objectif. »

Premier jet de Cowork (21 h 41), écarté : « la note combine la moyenne des artefacts retenus… ». **Principe de Grégoire (29 oct., 21 h 41) : « Avec les PAN, je préfère qu'on ne parle pas de moyenne, mais qu'on parle des meilleurs résultats ou des résultats les plus récents. »** Le calcul, lui, reste une moyenne des résultats retenus (Q5) : le texte nomme ce qui est retenu, sans nier ni dire la moyenne. Une seule version, avec ou sans artefact (« résultats » ne nomme ni l'un ni l'autre) ; « PAN-Standards » garde la graphie des blocs voisins (« PAN-Spécifications », « PAN-Dénotation »).

> PAN-Standards : la note retient les résultats de l'étudiant·e selon ta « Construction de la note » : les meilleurs, les plus récents ou tous. S'il y a une évaluation terminale, elle compte au poids de sa pondération.

## 8. « toutes tes productions évaluées », vrai seulement par défaut depuis le lot 4

✅ **Validé par Grégoire le 29 oct. 2026 à 21 h 43** (« on garde »). Deux endroits, la même correction : l'ordre change (« quels que soient… » avant l'exception, pour qu'il ne porte pas sur les productions décochées) et l'exception du lot 4 s'ajoute. Le reste de chaque texte ne change pas.

L'Aide, PAN – Standards (`index.html:~10285`), aujourd'hui : « Sans aucun artefact, elle se calcule à partir de toutes tes productions évaluées, sauf les diagnostiques, quels que soient leur type et leur pondération. »
> Sans aucun artefact, elle se calcule à partir de toutes tes productions évaluées, quels que soient leur type et leur pondération, sauf les diagnostiques et celles que tu décoches dans ta pratique, sous « Productions qui comptent dans la note ».

L'encadré « À vérifier » des Productions (`js/productions.js:~368`, validé au lot 3), aujourd'hui : « Sans aucun artefact, la note se calcule à partir de toutes tes productions évaluées, sauf les diagnostiques, quels que soient leur type et leur pondération. Une évaluation terminale est facultative. »
> Sans aucun artefact, la note se calcule à partir de toutes tes productions évaluées, quels que soient leur type et leur pondération, sauf les diagnostiques et celles que tu décoches dans ta pratique, sous « Productions qui comptent dans la note ». Une évaluation terminale est facultative.

## 9. Le bloc « PAN – Standards » de l'Aide (les familles de pratiques)

✅ **Validé par Grégoire le 29 oct. 2026 à 21 h 44** (« on garde »). (`index.html:~10245-10247`). Les deux phrases supposent un portfolio. Une seule version (l'Aide ne connaît pas la pratique du lecteur) ; la parenthèse décrit les modes au lieu de citer des libellés qui ont maintenant deux variantes, avec les mots du principe de 21 h 41 (« meilleurs résultats », « les plus récents »).

Aujourd'hui : « La note vise le niveau atteint pour des cibles d'apprentissage, lu à travers les traces retenues au portfolio. »
> La note vise le niveau atteint pour des cibles d'apprentissage, lu à travers les traces que la pratique retient : les artefacts d'un portfolio ou, sans portfolio, les autres productions.

Aujourd'hui : « À régler : l'échelle de niveaux, à choisir avant de créer la pratique ; la « Construction de la note » (« N meilleurs artefacts », « Tous les artefacts », « N derniers artefacts » ou « Hybride (N meilleures + Obligatoires) ») et le nombre d'artefacts retenus pour la note finale, s'il y a lieu. »
> À régler : l'échelle de niveaux, à choisir avant de créer la pratique ; la « Construction de la note » (les N meilleurs résultats, les N plus récents, tous, ou « Hybride (N meilleures + Obligatoires) ») et le nombre de résultats retenus pour la note finale, s'il y a lieu.

## 10. La formule du récit sans évaluation terminale (★ lue par les élèves)

✅ **Validé par Grégoire le 29 oct. 2026 à 21 h 45** (« on garde »), au regard de son principe de 21 h 41 (pas de « moyenne » en PAN). Objet neuf : il ne revient pas sur le mot neuf 1 du 28 oct., dont la forme avec terminale reste. `_formuleRecitStd` (`js/profil-etudiant-actions.js:~397`), lue au profil (« Note finale = … », `profil-etudiant-sections-affichage.js:~3692`), au PDF et au Comparateur.

Aujourd'hui, sans terminale : « moyenne du portfolio » ; sans « Artefact » : « moyenne des productions retenues ». Avec terminale (inchangé) : « portfolio × 60 % + terminale × 40 % ».

Recommandé : la même forme qu'avec une terminale, sans le terme absent.
> portfolio × 100 %

> productions retenues × 100 %

## 11. L'Aide PAN – Standards sans le mot « moyenne »

✅ **Validé par Grégoire le 29 oct. 2026 à 21 h 46** (« on garde »), au regard de son principe de 21 h 41. `index.html:~10285`, l'entrée « Comment ta pratique construit la note » (texte Standards validé le 29 oct. à 5 h 12, ici retouché dans deux phrases seulement). L'exemple chiffré reste : il montre le calcul (86,67) sans le nommer.

Aujourd'hui : « L'évaluation terminale pèse sa pondération, et la moyenne des productions retenues, en pourcentage, le reste ; »
> L'évaluation terminale pèse sa pondération, et les résultats retenus, en pourcentage, le reste ;

Aujourd'hui : « C'est une moyenne de notes : le niveau d'une copie n'y entre pas. »
> Ce sont les résultats en pourcentage qui comptent : le niveau d'une copie n'y entre pas.

## 12. La dernière phrase de l'entrée de l'Aide : le minimum

✅ **Validé par Grégoire le 29 oct. 2026 à 21 h 47** (« on garde »). `index.html:~10285`, fin de l'entrée « Comment ta pratique construit la note ». Elle cite l'ancien libellé (remplacé au texte 6) et ne dit qu'une partie de l'effet (la liste des étudiant·es le compte aussi, colonne « ≥ Min. », `etudiants.js:~755, ~942`). L'Aide ne connaît pas la pratique du lecteur : elle cite la partie commune aux deux variantes du libellé.

Aujourd'hui : « Le « Minimum d'artefacts avant calcul formatif » ne retient pas le calcul : il ne règle que les messages du profil. »
> Le minimum d'évaluations « pour un indice P fiable » ne retient pas le calcul de la note : sous ce nombre, le profil affiche « — » pour la performance, et la liste des étudiant·es le signale dans la colonne « ≥ Min. ».

## Reste à proposer

Rien : **les douze textes sont validés** (21 h 08 à 21 h 47). Consigne : `CONSIGNE-LOT-2026-10-29-standards-sans-portfolio-lot-5.md`.
