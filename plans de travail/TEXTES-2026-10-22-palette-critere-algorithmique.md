# Textes – Le critère algorithmique, étape 2b : la palette (provisoires)

> Claude Code, jeudi 22 octobre 2026, 21 h 42 (Toronto, mesuré par `date`), lot 2b de `CONSIGNE-DU-JOUR.md` (20 h 51). **Provisoires** : écrits par Claude Code, Cowork les tranche à la relecture. Ce sont des textes de l'enseignant ; **aucun n'est lu par un élève**. Chaque texte est cité tel qu'il est dans le code, avec son site. Aucun exemple propre à une discipline. Le banc `tests/unit/critere-algorithmique-palette.test.js` lit les noms de N.b et N.c, les titres de groupe (N.a) et la ligne d'invitation (P.b) : un texte changé ici doit l'être aussi à son site.

## 1. La palette (`js/palette-algo.js`, `TEXTES`)

| Site | Texte |
|---|---|
| `TEXTES.titre` (nom de la palette, lu par un lecteur d'écran seulement) | Blocs à poser |
| `TEXTES.groupes.posee` (titre du groupe bleu) | Ce que tu écris dans la grille |
| `TEXTES.groupes.remplie` (titre du groupe vert) | Ce qui se remplit à la correction |
| `TEXTES.invitation` (sans zone visitée depuis le rendu) | Place le curseur dans un texte : un bloc touché s'y pose, là où est le curseur. |
| `TEXTES.dans` (la cible) | Dans : « Défi prioritaire » |
| `TEXTES.zonePalier` (le nom d'une zone de palier dans la cible) | Verdict, palier 2 · Recommandation, palier 2 |
| `TEXTES.inactif` (sous un bloc que la zone visée n'offre pas) | Ce texte ne le remplit pas. |

Les titres des deux groupes sont ceux de la consigne. Les autres sont de moi.

## 2. Les blocs

Avec un critère de chimie nommé « unité manquante / unités manquantes » sur « calcul / calculs ». Un critère sans noms lit « erreurs » et « mots » à leur place ; un critère neuf sans noms lit le repli validé le 22 oct., « éléments relevés » et « éléments examinés ».

### 2.1 Ceux qui portent les noms du critère (`NOMMES`), neufs

| Jeton | Nom | Aide |
|---|---|---|
| `{erreurs}` | Compte des unités manquantes | Le nombre compté sur la copie, à la correction : les codes posés dans Annoter, ou le nombre tapé. |
| `{mots}` | Compte des calculs | Le nombre saisi à la correction, copie par copie. |
| `{nomErreurs}` | « unités manquantes » | *(aide validée le 22 oct., reprise telle quelle)* Le nom de ce que tu comptes, écrit sous le critère : au singulier sous 2, au pluriel à partir de 2. |
| `{nomMots}` | « calculs » | *(validée, reprise)* Le nom de ce à quoi tu rapportes le compte, écrit sous le critère : au singulier sous 2, au pluriel à partir de 2. |

Ce sont aussi les mots des pastilles **dans la phrase** (le composeur). Le décompte par défaut s'y lit ainsi : « Ta production contient [Compte des unités manquantes] [« unités manquantes »] [Somme pondérée] pour [Compte des calculs] [« calculs »]. » Les guillemets disent que le bloc pose le mot lui-même, et ils évitent de confondre ce bloc avec le compte. **Question pour Cowork** : garder les guillemets, ou choisir « Nom : unités manquantes » ?

L'élision : jamais « de » devant un nom de l'enseignant, et « des » ne s'élide jamais (« Compte des oublis »). Le banc N.b le vérifie.

### 2.2 Ceux qui gardent le libellé de leur registre (majuscule ajoutée)

| Jeton | Nom | Aide (du registre, inchangée) |
|---|---|---|
| `{critere}` | Nom du critère | Le nom de ce critère, tel qu'il est écrit dans la grille. |
| `{service}` | Nom du service | Le nom du service d'aide réglé plus haut. Vide : le badge disparaît. |
| `{seuil}` | Erreurs tolérées | Le nombre d'erreurs tolérées sur la longueur de référence (30 pour l'EUF). |
| `{longueur}` | Longueur de référence | La longueur de référence de l'épreuve, en mots (900 pour l'EUF). |
| `{moyenne}` | Mots par erreur | En moyenne, 1 erreur à chaque N mots : c'est ce N. Vide sur une copie sans erreur. |
| `{projection}` | Erreurs projetées | Le nombre d'erreurs que la copie ferait sur la longueur de référence, au même rythme. |
| `{palier}` | Palier atteint | Le nom du palier que la copie atteint, tel qu'il est écrit dans la colonne « Palier ». |

Ces cinq libellés de palier parlent encore d'erreurs et de mots : l'étape 3 les reprend (consigne, point 3).

### 2.3 `{points}` : son aide, coupée en aide et précision (`AIDES`, `PRECISIONS`)

- **Nom** (du registre) : Somme pondérée
- **Aide** : Entre parenthèses, le compte après pondération : « (5 après pondération) ». Il ne paraît que si un sous-critère ne pèse pas 1.
- **Précision** : Place-le juste après le compte. Une phrase sans lui ne montre que le compte, mais la ligne du calcul, dans le PDF, montre la parenthèse.

L'aide d'hier disait « le nombre » ; ici, « le compte », le mot des deux blocs voisins.

## 3. Dans le gabarit (`js/grilles.js`)

| Site | Avant | Maintenant |
|---|---|---|
| Étiquette du décompte (`paletteAlgo.nomDeZone`, `rendreChampEnonceAlgo`) | Décompte des erreurs | Décompte des unités manquantes *(un critère sans noms : « Décompte des erreurs », comme hier)* |
| Note sous les énoncés, carte « Bilan » (`rendreBlocEnoncesAlgo`) | Un clic sur un repère le pose dans la phrase, là où est le curseur — rien à taper. Le repère bleu est écrit dans la grille ; les verts se remplissent à la correction, copie par copie. Un repère que la phrase n'a pas à remplir disparaît proprement. Une zone laissée VIDE fait taire l'énoncé. | Un bloc que la phrase n'a pas à remplir disparaît proprement. Une zone laissée VIDE fait taire l'énoncé. |
| Note des paliers, carte « Ce que l'élève lit » (`palier-note-composer`) | Un clic sur un badge le pose dans la zone où est le curseur — sans curseur, dans « Verdict ». Les badges bleus sont écrits dans la grille ; les verts se remplissent à la correction, copie par copie, et un badge sans valeur disparaît. Sans badge, la phrase est précédée de « Tu fais en moyenne 1 erreur à chaque N mots » ; avec un badge, elle est entière : c'est toi qui l'écris. | Un bloc sans valeur disparaît. Sans bloc, la phrase est précédée de « Tu fais en moyenne 1 erreur à chaque N mots » ; avec un bloc, elle est entière : c'est toi qui l'écris. |

Ce qui part de ces notes : le geste (la palette le dit par sa ligne de cible) et les couleurs (les deux titres de groupe le disent).
