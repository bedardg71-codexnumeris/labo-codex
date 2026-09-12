# PROPOSITION — deux registres, un seul espace de numéros

**Date** : 12 septembre 2026, soir. **Demandé par** : la réconciliation du BACKLOG (Cowork, même jour,
`Rapports/RECONCILIATION-backlog-2026-09-12.md`). **Statut** : **DÉCIDÉ par Grégoire le 12 septembre
2026, soir : option C + la règle du lien**, appliquée le même soir (en-têtes de `BACKLOG.md` et de
SUIVI-BUGS, skill `debug-labo-codex` §6, `PROTOCOLE.md` règle 9). La proposition d'origine suit, inchangée.

## Le fait

`Retours des testeurs/SUIVI-BUGS.md` numérote ses bugs dans le même espace que les fiches de
`BACKLOG.md`. C'est ce qui a fait perdre la clôture de #631 : sa réparation était tracée sous le
numéro 831 du registre des bugs, lu comme la fiche #831 de l'autre registre.

Mesuré le 12 septembre au soir, **re-mesuré le même soir après la contre-vérification de Cowork**
(la première version de ce tableau donnait 840 fiches, 81 homonymes et 649 commits ; aucun des
trois ne se reproduit, et la méthode qui les avait produits n'était pas écrite).

**Méthode** (rejouable ; celle de Cowork, reproduite à l'identique) :
- *bugs* = première cellule des tableaux de SUIVI-BUGS, regex `^\|\s*#?(\d{1,4})\s*\|` ;
- *fiches* = lignes de case à cocher (`- [ ]` ou `- [x]`) de `BACKLOG.md` ET `BACKLOG-ARCHIVE.md`
  qui portent un `#N` dans leurs 80 premiers caractères ;
- *homonymes* = intersection des deux ensembles ;
- *commits* = message complet (`git log --all --format=%B`), `#N` extraits par `#(\d{1,4})\b`,
  un commit compté une fois quel que soit le nombre de numéros qu'il porte.

| Mesure | Valeur |
|---|---|
| Bugs numérotés dans SUIVI-BUGS | 136 (de 37 à 832) |
| Fiches numérotées au BACKLOG + archive | 810 numéros distincts (de 2 à 848), sur 855 lignes de case |
| Numéros présents dans LES DEUX registres | **123** — 112 contre l'archive seule, 10 contre `BACKLOG.md` seul, 1 (140) dans les deux |
| Commits qui nomment un `#N` où N est un numéro de bug | **407** sur 5 251 (856 occurrences) |
| … dont commits qui nomment un des 123 homonymes (les ambigus stricts) | **382** (778 occurrences) |
| Fichiers de `tests/` et `scripts/` qui portent un numéro de bug dans leur NOM | ~60 (`sentinelle-542-*`, `bulles-au-doigt-540`, `reparation-831-*`…) |
| Scripts qui LISENT un numéro de bug ou de fiche | **0** (`release.mjs` cite le BACKLOG en commentaire ; deux sentinelles Vitest n'utilisent « BACKLOG.md » que comme nom de fichier de fixture) |
| Références « bug #N » dans les documents de pilotage | 31 |

⚠ Les 123 homonymes ne sont pas tous des collisions. Sondés à la main : **114, 116, 121, 158, 539,
542, 543 = deux sujets différents** (vraies collisions ; bug 114 « CSP bloque le beacon Cloudflare »
contre fiche #114 « sélection fantôme au changement de page ») ; **811, 830 = le même sujet** (un
bug qui a reçu sa fiche sous le même numéro — cohérent, pas ambigu). Les 114 autres ne sont pas
qualifiés. Et les bugs récents (794-798, 806, 807, 831, 832) n'ont AUCUN homonyme au BACKLOG :
depuis le 9 septembre, ils ont pris leurs numéros dans la suite du BACKLOG. **De fait, les deux
registres partagent déjà un compteur depuis une semaine** ; la collision est un héritage de deux
blocs anciens : **37 et 48-161 (printemps) = 111 homonymes, dont 110 contre l'archive seule** — le
bloc du printemps est presque entièrement archivé, c'est pour ça qu'il se lit mal : on ne le voit
pas dans `BACKLOG.md`, et il continuera de mentir dans le journal git quoi qu'on décide ; puis
**534-543 (6-8 septembre) = 10 homonymes**, 8 contre `BACKLOG.md`, 2 (535, 537) contre l'archive ;
plus 811 et 830, le même sujet.

## Ce qui coûte, ce qui casse

Le journal git est immuable : les 382 commits qui nomment un homonyme garderont leur `#N` ambigu
quoi qu'on décide. Les
~60 noms de fichiers peuvent rester (renommer des sentinelles pour une question de registre
serait un geste sans valeur, avec un risque de casser des imports ou des baselines Playwright).
Aucun script ne casse, quelle que soit l'option : rien ne lit ces numéros. Ce qui reste à
migrer, au maximum, c'est le fichier SUIVI-BUGS (136 lignes) et 31 références textuelles.

## Trois options

**A — Préfixe `B-` pour les bugs testeurs, à partir de maintenant.** `B-833`, `B-834`… ; les 136
lignes existantes ne bougent pas, un encadré d'en-tête dit qu'avant le 12 septembre un numéro
sans préfixe est ambigu. Coût : dix lignes. Casse : rien. Reste : les 123 anciens restent ambigus
à la lecture du journal git, et le skill `debug-labo-codex` §6 doit dire le préfixe.

**B — Préfixe `B-` ET migration du stock** : les 136 lignes de SUIVI-BUGS et les 31 références des
documents de pilotage réécrites `B-N`. Coût : **nettement plus qu'une demi-journée** — chacun des
123 homonymes est à qualifier (même sujet ou collision) avant de réécrire, le sondage n'en a
qualifié que neuf, et 111 d'entre eux renvoient à des fiches archivées qu'il faut rouvrir pour
trancher ; le risque d'erreur croît d'autant. Casse :
rien dans le code ; les commits et les noms de fichiers restent en `N` nu, donc l'ambiguïté du
journal git demeure malgré la migration — c'est le point faible : on paie le stock sans acheter
le journal.

**C — Un seul compteur, officialisé** (c'est l'usage de fait depuis le 9 septembre) : un bug
testeur prend le prochain numéro du BACKLOG (« Dernier ID »), et personne ne réutilise un numéro.
Chaque `#N` devient unique dans les deux registres, le journal git et les noms de fichiers
compris — pour tout ce qui vient. Coût : une règle d'en-tête dans les deux fichiers, et rendre
fiable la ligne « Dernier ID » du BACKLOG (aujourd'hui contradictoire : #706, #707, #729, #754,
#774… coexistent en tête). Casse : rien. Reste : les 123 anciens homonymes, à lister une fois en
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
