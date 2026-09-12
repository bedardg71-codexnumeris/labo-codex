# PROPOSITION — deux registres, un seul espace de numéros

**Date** : 12 septembre 2026, soir. **Demandé par** : la réconciliation du BACKLOG (Cowork, même jour,
`Rapports/RECONCILIATION-backlog-2026-09-12.md`). **Statut** : PROPOSITION, rien d'appliqué —
c'est une décision de forme sur deux registres vivants, elle remonte à Grégoire.

## Le fait

`Retours des testeurs/SUIVI-BUGS.md` numérote ses bugs dans le même espace que les fiches de
`BACKLOG.md`. C'est ce qui a fait perdre la clôture de #631 : sa réparation était tracée sous le
numéro 831 du registre des bugs, lu comme la fiche #831 de l'autre registre.

Mesuré le 12 septembre au soir (grep sur les deux fichiers, `git log --all`) :

| Mesure | Valeur |
|---|---|
| Bugs numérotés dans SUIVI-BUGS | 136 (de 37 à 832) |
| Fiches numérotées au BACKLOG + archive | 840 (de 2 à 848) |
| Numéros présents dans LES DEUX registres | **81** |
| Messages de commit qui nomment un `#N` où N est un numéro de bug | 649 (les deux sens mêlés, indistinguables par machine) |
| Fichiers de `tests/` et `scripts/` qui portent un numéro de bug dans leur NOM | ~60 (`sentinelle-542-*`, `bulles-au-doigt-540`, `reparation-831-*`…) |
| Scripts qui LISENT un numéro de bug ou de fiche | **0** (`release.mjs` cite le BACKLOG en commentaire ; deux sentinelles Vitest n'utilisent « BACKLOG.md » que comme nom de fichier de fixture) |
| Références « bug #N » dans les documents de pilotage | 31 |

⚠ Les 81 homonymes ne sont pas tous des collisions. Sondés à la main : **539, 542, 543, 116 = deux
sujets différents** (vraies collisions) ; **811, 830 = le même sujet** (un bug qui a reçu sa fiche
sous le même numéro — cohérent, pas ambigu). Et les bugs récents (794-798, 806, 807, 831, 832)
n'ont AUCUN homonyme au BACKLOG : depuis le 9 septembre, ils ont pris leurs numéros dans la suite
du BACKLOG. **De fait, les deux registres partagent déjà un compteur depuis une semaine** ; la
collision est un héritage de deux blocs anciens : 48-161 (printemps) et 532-543 (6-8 septembre).

## Ce qui coûte, ce qui casse

Le journal git est immuable : les 649 commits garderont leur `#N` ambigu quoi qu'on décide. Les
~60 noms de fichiers peuvent rester (renommer des sentinelles pour une question de registre
serait un geste sans valeur, avec un risque de casser des imports ou des baselines Playwright).
Aucun script ne casse, quelle que soit l'option : rien ne lit ces numéros. Ce qui reste à
migrer, au maximum, c'est le fichier SUIVI-BUGS (136 lignes) et 31 références textuelles.

## Trois options

**A — Préfixe `B-` pour les bugs testeurs, à partir de maintenant.** `B-833`, `B-834`… ; les 136
lignes existantes ne bougent pas, un encadré d'en-tête dit qu'avant le 12 septembre un numéro
sans préfixe est ambigu. Coût : dix lignes. Casse : rien. Reste : les 81 anciens restent ambigus
à la lecture du journal git, et le skill `debug-labo-codex` §6 doit dire le préfixe.

**B — Préfixe `B-` ET migration du stock** : les 136 lignes de SUIVI-BUGS et les 31 références des
documents de pilotage réécrites `B-N`. Coût : une demi-journée de grep, avec un vrai risque
d'erreur sur les six homonymes « même sujet » (811, 830…), qu'il faudrait trancher un à un. Casse :
rien dans le code ; les commits et les noms de fichiers restent en `N` nu, donc l'ambiguïté du
journal git demeure malgré la migration — c'est le point faible : on paie le stock sans acheter
le journal.

**C — Un seul compteur, officialisé** (c'est l'usage de fait depuis le 9 septembre) : un bug
testeur prend le prochain numéro du BACKLOG (« Dernier ID »), et personne ne réutilise un numéro.
Chaque `#N` devient unique dans les deux registres, le journal git et les noms de fichiers
compris — pour tout ce qui vient. Coût : une règle d'en-tête dans les deux fichiers, et rendre
fiable la ligne « Dernier ID » du BACKLOG (aujourd'hui contradictoire : #706, #707, #729, #754,
#774… coexistent en tête). Casse : rien. Reste : les 81 anciens homonymes, à lister une fois en
en-tête de SUIVI-BUGS pour que plus personne ne s'y prenne.

## La règle qui manque, quelle que soit l'option

Aucune des trois n'aurait fermé #631 toute seule : le numéro n'était pas le seul défaut. **Une
ligne de SUIVI-BUGS qui répare ce qu'une fiche décrit NOMME la fiche (« ferme #631, #632 »), et la
case de la fiche se coche dans le même commit.** C'est ce lien, pas le préfixe, qui empêche une
clôture de rester dans un registre pendant que l'autre la croit ouverte. Il tient en une phrase
dans `debug-labo-codex` §6.

## Recommandation

**C + la règle du lien.** Zéro migration, zéro casse, et l'unicité vaut pour le journal git et les
noms de fichiers — ce que B n'achète pas malgré son coût. Le préfixe A reste possible en plus si
Grégoire veut distinguer d'un coup d'œil ce qui vient du terrain ; il ne remplace pas C.

**Question fermée pour Grégoire** : (1) C seul ; (2) C + préfixe A pour les prochains bugs ;
(3) B, migration du stock. Dans tous les cas la règle du lien s'ajoute.
