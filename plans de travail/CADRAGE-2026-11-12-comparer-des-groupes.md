# Cadrage — Comparer des groupes : l'outil d'étude du Labo (12 nov. 2026, v1)

> Page d'EXPLORATION, à corriger par Grégoire. Aucun code n'en découle tant qu'elle n'est pas relue.
> Née à l'aperçu du lot « Tendances » (PR #18, non fusionnée), quand le suivi longitudinal s'est
> révélé être un cas particulier d'une idée plus large.

## 1. L'idée, dans les mots de Grégoire (reformulés)

L'objet du Labo n'est pas de suivre des étudiant·es dans le temps : c'est d'**étudier les données en
comparant des groupes**. Deux groupes d'automne, deux groupes d'hiver, un d'automne et un d'hiver, le
même cours donné deux fois, un cours et celui qui le suit. Le suivi longitudinal est une option parmi
ces comparaisons. L'application possède déjà une bonne part des données qu'il faut ; le registre, lui,
n'ajoute que ce qu'on saisit à la main.

## 2. Une grammaire commune (proposition)

Toute comparaison se dit avec quatre mots :

- **Groupe** — un ensemble d'étudiant·es : un groupe-cours, une cohorte (un trimestre), un programme.
- **Facteur** — ce qui distingue les groupes qu'on oppose : le trimestre, la saison, le cours, le
  programme, avoir utilisé un jeton ou non, avoir reçu une intervention ou non.
- **Mesure** — ce qu'on regarde : la note finale, un indice (assiduité, complétion, performance),
  le niveau à un critère, la réussite (oui ou non).
- **Lecture** — la forme qui convient, et elle dépend d'UNE question : compare-t-on la même personne
  à elle-même, ou des personnes différentes ?

| Lecture | Ce qu'on a | Forme | Exige |
|---|---|---|---|
| **Appariée** | la MÊME personne, deux mesures (sa note en A, puis en B) | le nuage de points (lot 1) | de relier une personne à travers les trimestres : le registre |
| **Côte à côte** | des personnes DIFFÉRENTES, une même mesure (groupe 1, groupe 2) | deux distributions voisines (billes en colonnes, ou bandes) | rien de plus que les trimestres |
| **Dans le temps** | des groupes, une mesure suivie de semaine en semaine | des courbes | les instantanés hebdomadaires |

Le nuage ne sert donc qu'à la première lecture. C'est le point à ne pas perdre : « comparer » recouvre
trois formes, pas une.

## 3. Ce que l'application possède déjà (lu dans le code le 12 nov., sans analyse fine)

- **Par trimestre** : les groupes-cours et leurs étudiant·es (avec programme et statut), les indices
  A, C et P, les évaluations par critère, les présences, les interventions, les instantanés
  hebdomadaires, l'usage des jetons.
- **Les archives** : un groupe-cours archivé se charge dans le Labo en lecture seule
  (`js/labo-codex-data.js`, fichier codex data), « pour analyse longitudinale ». C'est une source de
  groupes à comparer qui existe.
- **Le registre** (`registreLongitudinal`) : relie une personne à travers les trimestres, garde une
  copie de ses dossiers, et reçoit les notes saisies à la main pour les cours donnés par d'autres.
- **Labo › Études**, deux cartes qui sont déjà des comparaisons :
  - « Impact des jetons » (`js/impact-jetons.js`) : facteur = jeton utilisé ou non ; mesure = P moyen ;
    lecture dans le temps.
  - « Dynamique des corrélations » (`js/correlations-longitudinales.js`) : le lien entre P et
    l'assiduité, la complétion, l'engagement, les interventions, semaine par semaine.
- **Labo › Comparateur** : autre chose. Il compare des PRATIQUES de notation sur des profils-types,
  pas des groupes réels.
- **Le lot « Tendances »** (aperçu) : un nuage qui reçoit déjà « deux mesures et un groupe » sans rien
  savoir des cours (`comparaisonDeCours`). C'est la première brique de la lecture appariée.

## 4. Des comparaisons candidates — à choisir, pas à tout faire

| # | Question d'enseignant·e | Facteur | Mesure | Lecture | Source |
|---|---|---|---|---|---|
| 1 | Mes étudiant·es réussissent-ils le cours suivant ? | cours | note | appariée | registre |
| 2 | Mon groupe de cet automne ressemble-t-il à celui de l'an dernier ? | trimestre | note, indices | côte à côte | trimestres, archives |
| 3 | Mes deux groupes du même cours, ce trimestre, diffèrent-ils ? | groupe | note, indices | côte à côte | trimestre actif |
| 4 | Automne et hiver donnent-ils les mêmes résultats ? | saison | note | côte à côte | trimestres, archives |
| 5 | Les jetons changent-ils quelque chose ? | jeton | P | dans le temps | existe (Études) |
| 6 | Tel programme réussit-il autrement ? | programme | note | côte à côte | trimestres |

## 5. Décisions déjà prises, qui valent pour tout l'outil

- Rien de propre à une discipline n'est écrit en dur : ce qu'on compare est déclaré par l'enseignant·e.
- L'écran ne commente ni la qualité des données ni celle de l'échantillon : il donne des comptes.
- Aucun nom réel hors de l'application ; le mode anonymisation s'applique partout.

## 6. Ce qui reste à trancher (à Grégoire)

1. **Par quoi commencer ?** Quelles comparaisons du § 4 répondent à un besoin que tu as VÉCU ?
2. **Une tension à nommer.** La carte « Dynamique des corrélations » calcule un r et s'impose un minimum
   d'étudiant·es ; la décision du 11 nov. a retiré du lot « Tendances » le lien calculé et tout jugement
   sur l'échantillon. Les deux ne se contredisent pas forcément (un r décrit, il ne juge pas), mais si
   Études rejoint l'outil, il faudra dire laquelle des deux règles gouverne.
3. **Le nom de l'outil**, et sa place : une sous-section neuve du Labo, ou Études refondue ?
4. **Le sort de l'onglet « Tendances »** : il reste dans Suivi longitudinal comme première comparaison,
   ou il déménage dans l'outil dès que celui-ci existe ?

## 7. Hors de ce cadrage

Aucun code. L'onglet « Tendances » reste tel quel dans l'aperçu, sans fusion. Les cartes d'Études ne
sont pas touchées. Ce que chaque source permet exactement (les archives surtout) reste à mesurer avant
de promettre une comparaison.
