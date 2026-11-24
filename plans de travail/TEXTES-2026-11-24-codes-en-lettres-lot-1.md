# Textes proposés : codes en lettres, lot 1 (24 nov. 2026)

Branche `lot/codes-en-lettres-1-lisibles`. Chaque texte d'écran neuf ou modifié par le lot, un par ligne, avec l'endroit où il paraît. **Ce sont des propositions** : corrige-les ici, la session suivante les reportera.

**Qui les lit** : l'enseignant·e seulement, dans l'écran de la grille (Conception › Grilles, critère algorithmique) et dans « Apporter mon matériel » (une liste de codes collée). Aucun mot que les élèves lisent n'a changé : sur la copie et dans le PDF, un code de trois ou quatre caractères change de forme (une pastille), pas de mots. Règle 13 : un mot que lit seulement l'enseignant·e part tel quel sans réponse et reste corrigeable ensuite.

Les codes cités (« K-A », « É-B », « ABCDE ») sont les exemples du banc. À l'écran, c'est le code tapé qui s'affiche.

↻ **Mis à jour à la suite de 17 h 55** : la règle des quatre caractères au plus (T3, C1) ; « 20 caractères au plus » retiré de T1 et de N1, qui parlent de la saisie.

## Le témoin d'enregistrement, quand un code tapé est refusé

Le témoin préfixe « Non enregistré : », met la première lettre en minuscule et ajoute le point final (`raisonPourTemoin`, inchangé).

| # | Où | Texte proposé | Source |
|---|---|---|---|
| T1 | Témoin, après un code accentué, une espace ou un caractère hors liste dans le champ « Code » | Non enregistré : un code s’écrit en lettres sans accent, chiffres, tiret ou souligné. | `js/grilles.js`, `REFUS_SOUS_CRITERES.codeIllisible` |
| T2 | Témoin, après un code qui ne diffère d'un autre du même critère que par la casse (« k-a » quand « K-A » existe) | Non enregistré : le code « K-A » est déjà dans ce critère : majuscules et minuscules y comptent pour la même lettre. | `js/grilles.js`, `REFUS_SOUS_CRITERES.codeDouble` |
| T3 | Témoin, après un code de cinq caractères ou plus (« ABCDE ») | Non enregistré : un code a quatre caractères au plus : plus long, il couvre trop de place sur la copie. | `js/grilles.js`, `REFUS_SOUS_CRITERES.codeLong` |

## La note sous les sous-critères (bloc « codes d'annotation » du critère algorithmique)

Avant le lot, tout sous-critère écarté y était compté comme « Un sous-critère de pondération 0 n'est pas un code posable ». Cette phrase reste, mot pour mot, pour les seuls sous-critères de poids nul. Trois phrases neuves disent les autres raisons. Un code ancien de plus de quatre caractères se pose : la note n'en dit rien.

| # | Où | Texte proposé | Source |
|---|---|---|---|
| N1 | Note, un sous-critère dont le code a un accent ou un caractère hors liste (au singulier) | Ce code ne se pose pas : É-B. Un code s’écrit en lettres sans accent, chiffres, tiret ou souligné. | `js/grilles.js`, `phrasesCodesEcartes` |
| N1p | Même cas, plusieurs codes | Ces codes ne se posent pas : É-A, É-B. Un code s’écrit en lettres sans accent, chiffres, tiret ou souligné. | idem |
| N2 | Note, un sous-critère sans code | Un sous-critère sans code ne se pose pas (un ici). | idem |
| N2p | Même cas, plusieurs | Un sous-critère sans code ne se pose pas (3 ici). | idem |
| N3 | Note, un code identique à un code plus haut, au caractère près (déjà enregistré ; la saisie le refuse désormais) | Ce code est déjà pris plus haut et ne se pose pas : K-A. | idem |
| N3p | Même cas, plusieurs | Ces codes sont déjà pris plus haut et ne se posent pas : K-A, M-B. | idem |

## « Apporter mon matériel », une liste de codes collée

La liste s'affiche avec ce qui manque avant de créer (« Avant de créer, il reste : … »). Une raison neuve :

| # | Où | Texte proposé | Source |
|---|---|---|---|
| C1 | Ce qui manque, quand un code collé a plus de quatre caractères | des codes de 4 caractères au plus (« ABCDE ») | `js/materiel-dissection-lecture.js`, `codesCompris` |

## Pour comparaison, un texte voisin qui n'a pas changé

- La raison voisine de C1, pour un code illisible, dit encore « des codes faits de lettres, de chiffres, de « - » ou de « _ », 20 caractères au plus » (`js/materiel-dissection-lecture.js`, `codesCompris`). Je ne l'ai pas touchée : un banc d'un autre lot l'ancre mot pour mot (`tests/unit/critere-algorithmique-coller-codes.test.js:91`). À côté de C1, « 20 au plus » se lit mal. Proposition : retirer « , 20 caractères au plus » (un code de 5 à 20 caractères est désormais refusé par C1) ; dis-le, et je réancre ce banc.

## Pour l'essai seulement (à retirer avant la fusion)

| # | Où | Texte | Source |
|---|---|---|---|
| E1 | `departs.html`, titre de la section d'essai | Essai : les codes en lettres | `departs.html` |
| E2 | `departs.html`, sa phrase | Une classe fictive de quatre personnes, une production, une grille aux dix-sept codes fictifs (K-A à W-12) et une copie fictive déjà importée : ouvre la copie et pose des codes tout de suite. | `departs.html` |
