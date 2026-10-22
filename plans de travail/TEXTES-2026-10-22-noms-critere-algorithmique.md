# Textes – Le critère algorithmique, étape 2a : les deux noms de l'enseignant (validés le 22 oct. 2026)

> Claude Code, jeudi 22 octobre 2026, 17 h 15 (Toronto, mesuré par `date`), lot 2a de `CONSIGNE-DU-JOUR.md`. **Validés le 22 oct. 2026 (voir « Validation », en fin de fichier ; mis au code à 18 h 40)** — à l'origine provisoires : écrits par Claude Code, à soumettre à Grégoire par Cowork **avant la release**. Chaque texte est cité tel qu'il est dans le code, avec son site. Les bancs Vitest lisent ce fichier : un texte changé ici doit l'être aussi à son site (et inversement).

## 1. Ce que l'élève lit

Ce qui suit n'est pas un texte neuf, sauf le repli (1.3).

1.1. **La phrase du décompte, modèle « Générique »** (`evaluation-enonces.js`, `ENONCES_GENERIQUES.decompte`) : la structure arrêtée par Grégoire le 2 septembre ne change pas ; seuls les deux noms deviennent des jetons. Avec un critère de chimie nommé « unité manquante / unités manquantes » sur « calcul / calculs » :

> Ta production contient 5 unités manquantes (3,5 après pondération) pour 12 calculs.

Un critère sans noms (tout critère d'avant ce lot) lit, au caractère près, la phrase d'hier : « Ta production contient 5 erreurs pour 400 mots. »

1.2. **La ligne du PDF** (`synthese-retroaction-rendu.js`, `ligneCalculAlgo`) :

> 5 unités manquantes (3,5 après pondération) sur 12 calculs → 14,5/20 (72,5 %)

1.3. **Le repli d'un critère né depuis ce lot (marque `nomsAttendus`) évalué sans ses noms** — un critère créé avant, en 1.213 et 1.214 compris, lit « erreur » et « mot » (retouche de la relecture, 17 h 44) (`evaluation-enonces.js`, `NOMS_PROVISOIRES`). Jamais un nom vide ni un jeton nu. Ce que je propose :

- ce que l'on compte : « élément relevé » / « éléments relevés »
- ce à quoi on le rapporte : ~~« unité » / « unités »~~ ⮕ **« élément examiné » / « éléments examinés »**

> Ta production contient 5 éléments relevés pour 12 éléments examinés.

⮕ **Décision de Grégoire, 22 oct. 2026, 18 h 29 : « éléments examinés »** (recommandation de Cowork, retenue telle quelle). Motif : en chimie, « unité » est justement ce qui manque (« unité manquante ») ; « 12 unités » se lirait comme des unités de mesure. L'invitation d'Annoter (§ 3), qui cite le repli, suit d'elle-même : « … l'élève lit « élément relevé » et « élément examiné ». »

1.4. **Le bilan, critère effondré** (`evaluation-retroaction.js`, `_rendreAlgoA0Bilan`) — même structure, les deux noms accordés (ajouté à la relecture, 17 h 44) :

> - **Unités et chiffres significatifs est à travailler en priorité** (Unités et chiffres significatifs : 5 unités manquantes sur 12 calculs, Incomplet)

Sans noms : « (… : 5 erreurs sur 400 mots, Incomplet) », comme hier.

1.5. **« Tous les critères sont maîtrisés »**, bilan de l'app et PDF de synthèse, mêmes mots (`enoncesAlgo.nombreEtNom`). **Décision de Grégoire, 22 oct. 2026, 17 h 43 : le participe part**, pour tous les critères :

> Tous les critères sont maîtrisés. Concentre-toi sur Unités et chiffres significatifs (3 unités manquantes).

Sans noms : « (3 erreurs) » — hier « (3 erreurs annotées) ».

1.6. **« Aucune annotation »**, vu par l'enseignant seulement (`ENONCES_GENERIQUES.aucune`) : « Aucun tampon ni ‹nom au singulier› annotés. » (« annotés » s'accorde au masculin pluriel avec « tampon », juste avec tout nom.)

## 2. L'éditeur de grille (`grilles.js`, `TEXTES_NOMS_ALGO`)

En tête du gabarit d'un critère algorithmique, avant les sous-critères.

| Élément | Texte |
|---|---|
| Rangée 1 | Ce que tu comptes |
| Rangée 2 | Ce à quoi tu le rapportes |
| Petites étiquettes | Singulier · Pluriel |
| Exemple grisé, rangée 1 | Ex. : unité manquante · Ex. : unités manquantes |
| Exemple grisé, rangée 2 | Ex. : calcul · Ex. : calculs |
| Invitation (tant qu'une paire manque) | Nomme ce que tu comptes et ce à quoi tu le rapportes, au singulier et au pluriel : l'élève lit ces noms dans la phrase du décompte et dans son PDF. |
| Refus, au témoin, d'une forme trop longue (`appliquerNoms`) | Un nom fait 40 caractères au plus |
| Aide sous le bloc | Ces noms remplacent « erreur » et « mot » dans les champs de l'évaluation, la phrase du décompte et la ligne du PDF. |

## 3. Annoter (`travaux-outils.js`, `_texteNomsManquants`)

Dans la palette des codes, tant que le critère neuf de la copie n'a pas ses deux noms :

> Ton critère algorithmique n'a pas encore ses deux noms : ce que tu comptes, et ce à quoi tu le rapportes. Écris-les dans la grille ; d'ici là, l'élève lit « élément relevé » et « élément examiné ».

Le total de l'en-tête de la palette suit le nom : « (3 unités manquantes) ».

## 4. L'évaluation (`evaluation-chargement.js`, `_nomsChampsAlgo`)

Les champs « Nombre d'erreurs » et « Nombre de mots » portent le nom au pluriel, seul, avec sa majuscule : « Erreurs », « Mots » ; « Unités manquantes », « Calculs ». Sans « de » devant : « Nombre de unités » ne se pose pas. La ligne de résultat dit « 5 unités manquantes sur 12 calculs → … ».

## 5. Les aides

**G3, sous la formule** (`grilles.js`, aide de « Formule appliquée »), avec les noms du critère :

- modèle qui emploie l'étendue : Lors de l'évaluation, « Erreurs » se remplit avec les codes que tu poses dans Annoter, ou se tape ; « Mots » se tape.
- modèle qui ne l'emploie pas : Lors de l'évaluation, seul le champ « Erreurs » entre dans la note. Le champ « Mots » reste saisi pour la rétroaction.

**B1, la bulle du badge « ALGORITHMIQUE »** (`accompagnement-contenu-hover.js`, `eval-francais-ecrit`, texte fixe) : La note de ce critère se calcule par une formule. Le champ de ce que tu comptes se remplit avec les codes que tu poses dans Annoter, ou se tape ; celui de ce à quoi tu le rapportes se tape. Les deux portent les noms que tu as donnés au critère dans la grille. La rétroaction se compose avec les phrases écrites dans la grille.

**C2, l'aide du repère {points}** (`evaluation-enonces.js`, `REPERES`) : Entre parenthèses, le nombre après pondération : « (5 après pondération) ». Il ne paraît que si un sous-critère ne pèse pas 1 ; place-le juste après le nombre. Une phrase sans lui ne montre que le nombre posé, mais la ligne du calcul, dans le PDF, montre la parenthèse.

**Section 5c de l'Aide** (`index.html`) :

- D3 : Tu nommes, au singulier et au pluriel, ce que tu comptes et ce à quoi tu le rapportes : « erreur » sur des « mots » pour une rédaction, « unité manquante » sur des « calculs » en chimie, « faute de rythme » sur des « mesures » en musique. Ces noms s'écrivent dans les champs de l'évaluation, dans la phrase du décompte et dans le PDF de l'étudiant·e. Un critère créé avant ces noms se lit « erreur » et « mot ».
- D4b : Exemple : sept codes posés, trois d'un sous-critère qui pèse 1 et quatre d'un sous-critère qui pèse 0,5. La formule reçoit 3 + 2 = 5, et l'étudiant·e lit « 7 erreurs (5 après pondération) ».
- D6 (seul « le champ de ce que tu comptes » change) : Dans Annoter, les sous-critères sont les codes que tu poses, sur toute copie évaluée avec cette grille. Chaque code posé compte une occurrence de son sous-critère ; le champ de ce que tu comptes se remplit tout seul, et la formule reçoit le nombre pondéré. Sans code posé, tu tapes le nombre : il compte tel quel, sans pondération. Une grille plus ancienne montre la case « Utiliser ces sous-critères comme codes d'annotation » ; décochée, sa palette garde les dix codes de départ, des codes de correction du français.
- D7 : L'étudiant·e lit la phrase du décompte écrite dans la grille et, dans son PDF, la ligne du calcul : « 7 erreurs (5 après pondération) sur 400 mots → 13,75/20 (68,8 %) ». La parenthèse ne paraît que si le nombre pondéré diffère du nombre posé.

## 6. Le miroir du gabarit (`miroir-algo.js`, `libelles`)

- une copie sans étendue : champ « Mots » vide
- aucune note : la formule a besoin du champ « Mots »
- Sans projection, ces copies ont la longueur du facteur : chaque ‹nom au singulier› y coûte un point, quel que soit le facteur.
- la copie fictive sous un palier (`grilles.js`) : — copie fictive, 5 unités manquantes pour 12 calculs

## 7. Les deux repères posables (`evaluation-enonces.js`, `REPERES`)

Ajoutés à la palette du décompte (et `{nomErreurs}` à « Aucune annotation »), famille « écrit dans la grille », comme le nom du critère. Sans eux, le décompte par défaut montrerait `{nomErreurs}` en texte brut dans le composeur. La pastille porte le nom de code, comme les quatre autres (l'étape 2b les nommera en mots).

| Jeton | Libellé | Aide |
|---|---|---|
| `{nomErreurs}` | ce que tu comptes | Le nom de ce que tu comptes, écrit sous le critère : au singulier sous 2, au pluriel à partir de 2. |
| `{nomMots}` | ce à quoi tu le rapportes | Le nom de ce à quoi tu rapportes le compte, écrit sous le critère : au singulier sous 2, au pluriel à partir de 2. |

## Validation (Cowork, 18 h 30)

- **Ce que l'élève lit** (§ 1) : 1.1, 1.2 et 1.4 suivent des structures déjà arrêtées ; 1.5 est la décision de 17 h 43 ; 1.3 est la décision de 18 h 29. **Tout est réglé.**
- **Les textes de l'enseignant** (§ 1.6, 2 à 7) : tranchés par Cowork (`CLAUDE.md` : seuls les mots que les élèves lisent remontent à Grégoire). Retenus tels quels, sauf les deux aides du § 7, dont l'exemple venait de la rédaction (« 1 erreur », « 1 mot » ; principe de Grégoire du 21 oct. : aucun exemple propre à une discipline) :
  - `{nomErreurs}` : « Le nom de ce que tu comptes, écrit sous le critère : au singulier sous 2, au pluriel à partir de 2. »
  - `{nomMots}` : « Le nom de ce à quoi tu rapportes le compte, écrit sous le critère : au singulier sous 2, au pluriel à partir de 2. »
- Ces textes ne sont plus provisoires une fois ces deux changements faits au code.
- **Les Nouvelles 1.215** : validées par Grégoire à 18 h 31, mot pour mot (texte dans `CONSIGNE-DU-JOUR.md` de 18 h 31).
