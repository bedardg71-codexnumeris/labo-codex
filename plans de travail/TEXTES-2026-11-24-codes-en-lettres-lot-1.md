# Textes proposés : codes en lettres, lot 1 (24 nov. 2026)

Branche `lot/codes-en-lettres-1-lisibles`. Chaque texte d'écran neuf ou modifié par le lot, un par ligne, avec l'endroit où il paraît. **Ce sont des propositions** : corrige-les ici, la session suivante les reportera.

**Qui les lit** : l'enseignant·e seulement, dans l'écran de la grille (Conception › Grilles, critère algorithmique). Aucun mot que les élèves lisent n'a changé : le PDF ne change que de taille de lettre dans le cercle d'un code. Règle 13 : un mot que lit seulement l'enseignant·e part tel quel sans réponse et reste corrigeable ensuite.

Les codes cités (« K-A », « É-B ») sont les exemples du banc. À l'écran, c'est le code tapé qui s'affiche.

## Le témoin d'enregistrement, quand un code tapé est refusé

Le témoin préfixe « Non enregistré : », met la première lettre en minuscule et ajoute le point final (`raisonPourTemoin`, inchangé).

| # | Où | Texte proposé | Source |
|---|---|---|---|
| T1 | Témoin, après un code accentué, une espace, un caractère hors liste ou plus de 20 caractères dans le champ « Code » | Non enregistré : un code s’écrit en lettres sans accent, chiffres, tiret ou souligné, 20 caractères au plus. | `js/grilles.js`, `REFUS_SOUS_CRITERES.codeIllisible` |
| T2 | Témoin, après un code qui ne diffère d'un autre du même critère que par la casse (« k-a » quand « K-A » existe) | Non enregistré : le code « K-A » est déjà dans ce critère : majuscules et minuscules y comptent pour la même lettre. | `js/grilles.js`, `REFUS_SOUS_CRITERES.codeDouble` |

## La note sous les sous-critères (bloc « codes d'annotation » du critère algorithmique)

Avant le lot, tout sous-critère écarté y était compté comme « Un sous-critère de pondération 0 n'est pas un code posable ». Cette phrase reste, mot pour mot, pour les seuls sous-critères de poids nul. Trois phrases neuves disent les autres raisons.

| # | Où | Texte proposé | Source |
|---|---|---|---|
| N1 | Note, un sous-critère dont le code a un accent ou un caractère hors liste (au singulier) | Ce code ne se pose pas : É-B. Un code s’écrit en lettres sans accent, chiffres, tiret ou souligné, 20 caractères au plus. | `js/grilles.js`, `phrasesCodesEcartes` |
| N1p | Même cas, plusieurs codes | Ces codes ne se posent pas : É-A, É-B. Un code s’écrit en lettres sans accent, chiffres, tiret ou souligné, 20 caractères au plus. | idem |
| N2 | Note, un sous-critère sans code | Un sous-critère sans code ne se pose pas (un ici). | idem |
| N2p | Même cas, plusieurs | Un sous-critère sans code ne se pose pas (3 ici). | idem |
| N3 | Note, un code identique à un code plus haut, au caractère près (déjà enregistré ; la saisie le refuse désormais) | Ce code est déjà pris plus haut et ne se pose pas : K-A. | idem |
| N3p | Même cas, plusieurs | Ces codes sont déjà pris plus haut et ne se posent pas : K-A, M-B. | idem |

## Pour comparaison, un texte voisin qui n'a pas changé

- L'import par dissection d'une liste de codes dit déjà « des codes faits de lettres, de chiffres, de « - » ou de « _ », 20 caractères au plus » (`js/materiel-dissection-lecture.js:1205`). T1 et N1 ajoutent « sans accent », la raison qui manquait. Les deux formulations peuvent s'aligner à ton choix.
