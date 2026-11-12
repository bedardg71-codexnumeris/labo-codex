# Cadrage — Comparer des groupes : l'outil d'étude du Labo (12 nov. 2026, v7)

> Page d'EXPLORATION, à corriger par Grégoire. Aucun code n'en découle tant qu'elle n'est pas relue.
> Née à l'aperçu du lot « Tendances » (PR #18, non fusionnée), quand le suivi longitudinal s'est
> révélé être un cas particulier d'une idée plus large.

## 1. L'idée, dans les mots de Grégoire (reformulés)

L'objet du Labo n'est pas de suivre des étudiant·es dans le temps : c'est d'**étudier les données en
comparant des groupes**. Deux groupes d'automne, deux groupes d'hiver, un d'automne et un d'hiver, le
même cours donné deux fois, un cours et celui qui le suit. Le suivi longitudinal est une option parmi
ces comparaisons. L'application possède déjà une bonne part des données qu'il faut ; le registre, lui,
n'ajoute que ce qu'on saisit à la main.

### 1 bis. À quoi sert l'outil (Grégoire, 12 nov. — v2)

Labo Codex est un outil de **développement professionnel** : suivre l'apprentissage, soutenir
l'enseignement. Avec les micro-données recueillies en classe et dans les travaux, il donne à voir
l'écosystème enseignement-apprentissage. L'outil d'étude — le « microscope » — sert à **voir l'effet
des choix d'enseignement sur l'apprentissage, y compris à long terme**.

- **L'hypothèse d'origine** : la façon de donner le cours (pratique alternative, jetons) bâtit une base
  assez solide et durable pour la réussite des cours suivants. C'est la comparaison n° 1 du § 4, et
  c'est par elle qu'on commence.
- **Ce qu'on compare, au fond, ce sont des VERSIONS de son enseignement.** Les groupes sont le moyen de
  les observer. Un·e enseignant·e change quelque chose (par exemple : des jetons structurés autour d'une
  réflexion métacognitive), puis veut voir si la nouvelle version fait mieux que celle d'il y a un
  trimestre ou deux. Un jeton ne vaut pas par la hausse d'un chiffre : son effet se cherche dans
  l'apprentissage.
- **Le journal des changements** (accepté par Grégoire) : l'application connaît les trimestres, les
  notes et l'usage des jetons, mais pas ce qui a changé dans le cours. L'enseignant·e le note — « quoi »,
  « depuis quel trimestre » — et ce journal devient le facteur de comparaison « avant / après ».
- **Sa lignée** : Labo › Bilan porte déjà l'introspection de l'enseignant·e sur sa pratique
  (questionnaire aux étudiant·es, parcours, auto-réflexion : `js/bilan-reflexif*.js`). Le journal
  s'inscrit dans cette lignée ; s'il doit y vivre ou seulement s'y relier reste à voir (§ 6).
- **Une limite pour nous, pas pour l'écran** : l'outil montre des différences, pas leurs causes. Un
  groupe qui réussit mieux après un changement peut le devoir au changement, au groupe, à la saison ou
  au hasard ; la lecture se raffermit avec le nombre de trimestres comparés. L'écran, lui, continue de
  donner des comptes sans commenter (§ 5).

### 1 ter. Le cycle : une hypothèse, une observation, une conclusion (Grégoire, 12 nov. — v3)

Le nom dit le concept. **Le labo** est le lieu de l'expérimentation : on y observe. **Le codex** est le
livre, le journal qu'on tient : la part introspective et analytique. C'est leur combinaison qui améliore
l'enseignement, parce que la réflexion repose sur des données observées en classe.

Le journal des changements ne note donc pas seulement « quoi » et « depuis quand ». Chaque entrée suit
le cycle entier :

1. **J'ai une hypothèse** — ce que je change, et ce que j'en attends, écrit AVANT de voir les données ;
2. **J'observe** — la ou les comparaisons qui s'y rapportent (§ 4) ;
3. **Je conclus** — ce que j'en retiens, écrit par l'enseignant·e. L'application montre ; elle ne
   conclut pas à sa place (§ 5).

**Une étude** (mot confirmé par Grégoire, v4) : cette unité — une hypothèse, ses observations, sa
conclusion. Le mot existe déjà dans le Labo (« Études ») ; il prend ici son sens plein. Son fondement,
dans les mots de Grégoire : un·e enseignant·e est avant tout un·e apprenant·e, et l'application le
soutient en lui permettant d'observer les effets de ce qu'il ou elle fait.

**Le microscope** (nom de TRAVAIL, v4) : l'instrument où l'on observe les micro-données, puisque toute
l'application repose sur elles. On y mène des études. Deux mots, deux choses : le microscope est
l'instrument ; l'étude est la démarche qu'on y conduit.

Conséquence assumée par Grégoire : il y aura des réaménagements, peut-être des sections à redécouper.
On raffine les outils ET la cohésion qu'ils ont entre eux. Rien de cela n'est engagé ici.

## 2. Une grammaire commune (proposition)

Toute comparaison se dit avec quatre mots :

- **Groupe** — un ensemble d'étudiant·es : un groupe-cours, une cohorte (un trimestre), un programme.
- **Facteur** — ce qui distingue les groupes qu'on oppose. Le premier en importance (v2) : **ce que
  l'enseignant·e a changé dans son cours**, tel que son journal le dit. Puis : le trimestre, la saison,
  le cours, le programme, avoir utilisé un jeton ou non, avoir reçu une intervention ou non.
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
| 7 | Ce que j'ai changé dans mon cours a-t-il eu un effet ? (v2) | un changement du journal | note, indices, n° 1 et n° 5 | avant / après | journal + trimestres, archives, registre |

**Ordre retenu par Grégoire (12 nov.)** : la n° 1 d'abord, c'est l'origine de la recherche. Les jetons
(n° 5) et le changement de méthode (n° 7) viennent ensuite ; automne et hiver (n° 4) pour comprendre la
dynamique des groupes.

## 5. Décisions déjà prises, qui valent pour tout l'outil

- Rien de propre à une discipline n'est écrit en dur : ce qu'on compare est déclaré par l'enseignant·e.
- L'écran ne commente ni la qualité des données ni celle de l'échantillon : il donne des comptes.
- Aucun nom réel hors de l'application ; le mode anonymisation s'applique partout.

## 6. Ce qui reste à trancher (à Grégoire)

1. ~~Par quoi commencer ?~~ **Tranché (v2)** : la n° 1, puis les jetons et le changement de méthode.
1 bis. ~~Que note le journal ?~~ **Tranché (v3)** : l'hypothèse, l'observation, la conclusion (§ 1 ter).
   Reste : où vit-il (dans Bilan, dans l'outil, ou l'outil EST ce journal) ?
2. **Une tension à nommer.** La carte « Dynamique des corrélations » calcule un r et s'impose un minimum
   d'étudiant·es ; la décision du 11 nov. a retiré du lot « Tendances » le lien calculé et tout jugement
   sur l'échantillon. Les deux ne se contredisent pas forcément (un r décrit, il ne juge pas), mais si
   Études rejoint l'outil, il faudra dire laquelle des deux règles gouverne.
3. **Le nom de l'outil**, et sa place : une sous-section neuve du Labo, ou Études refondue ?
4. **Le sort de l'onglet « Tendances »** : il reste dans Suivi longitudinal comme première comparaison,
   ou il déménage dans l'outil dès que celui-ci existe ?

## 6 bis. La première étude, de bout en bout (v5) — pour voir ce qui manque

**Étude n° 1 : mes étudiant·es réussissent-ils le cours suivant ?**

1. **J'ai une hypothèse.** L'enseignant·e l'écrit, avant de regarder : « La façon dont je donne mon
   cours — la pratique alternative, les jetons — bâtit une base assez solide pour la réussite du cours
   suivant. » Puis ce qui est attendu, dans ses mots, et les cohortes visées.
2. **J'observe.** Le microscope montre :
   - le nuage du lot « Tendances » : pour chaque inscrit·e, sa note dans le cours d'origine face à sa
     note dans le suivant, par cohorte ; et les comptes (combien ont réussi les deux) ;
   - la même chose selon un FACTEUR tiré de l'hypothèse : a utilisé un jeton ou non. La donnée existe :
     l'usage d'un jeton est une marque posée sur l'évaluation (`jetonRepriseApplique`), et le registre
     copie les évaluations entières (inférence à mesurer : la marque doit donc être dans la copie) ;
   - d'une cohorte à l'autre, si un changement du journal s'intercale : avant, après.
3. **Je conclus.** L'enseignant·e écrit ce qu'il ou elle en retient, daté. L'étude reste ouverte : une
   cohorte de plus, et l'observation s'enrichit ; la conclusion peut être reprise.

**Ce qui manque entre l'onglet « Tendances » d'aujourd'hui et cette étude** :

| Manque | Aujourd'hui | Pour l'étude |
|---|---|---|
| Un lieu pour l'hypothèse et la conclusion | rien | deux textes, attachés à l'étude |
| L'étude comme objet | seule la séquence de cours est gardée | ce qu'on compare + hypothèse + conclusion, sous un nom |
| Un facteur autre que la cohorte | les billes se teintent par cohorte seulement | teinter ou séparer par jeton, par changement du journal |
| Le journal des changements | rien | « quoi », « depuis quel trimestre » |
| La saisie des notes du cours suivant | une à une, à la main, au registre | à voir : c'est le coût réel de cette étude |
| Un point de repère | aucun : on ne voit que ses propres étudiant·es | à décider par Grégoire (voir ci-dessous) |

**Le point de repère, une question de fond.** « Assez solide » se juge par rapport à quoi ? Le
microscope ne voit que les étudiant·es de l'enseignant·e. Il peut comparer ses cohortes entre elles
(avant et après un changement) ; il ne peut pas les comparer à celles de collègues, faute de leurs
données. L'étude n° 1 répond donc bien à « est-ce que ça s'améliore chez moi ? », moins bien à
« est-ce mieux qu'ailleurs ? ». À l'enseignant·e d'écrire, dans son hypothèse, ce qui la confirmerait.

### Le point de repère — tranché par Grégoire (v6)

**Pour l'instant, la question longitudinale ne repose que sur le SEUIL DE RÉUSSITE.** La note fine du
cours suivant ne se compare pas : trop de variables. Le jour où plusieurs enseignant·es auront des
pratiques comparables, on pourra regarder au-delà du seuil ; pas avant.

- **La question posée** : puis-je conclure, avec une certitude raisonnable, que je prépare bien mes
  étudiant·es — que mon enseignement est efficace et leur apprentissage durable ? Si elles et ils
  réussissent mon cours puis échouent tous le suivant, on peut légitimement se demander s'ils étaient
  bien préparés, et pas seulement conclure que le second cours était plus difficile.
- **Ce que l'enseignant·e peut faire dès maintenant** : comparer ses propres cohortes entre elles.
- **Forme retenue par Grégoire (v7)** : LES DEUX, le tableau de comptes D'ABORD, le nuage ensuite. Le
  nuage apporte une nuance que le tableau n'a pas (où se situe chaque personne, pas seulement de quel
  côté du seuil) ; elle se lit avec prudence et ne s'extrapole pas. (Mots de Grégoire, corrigés par lui :
  « le nuage offre une nuance que le tableau en colonnes n'offre pas ».)
- **Le raisonnement qui y mène** : la mesure de l'étude n° 1 est « a réussi / n'a pas
  réussi », dans chacun des deux cours. Le nuage, lui, place la note exacte du cours suivant : il montre
  donc plus que ce qu'on s'autorise à lire. La lecture juste serait un tableau de comptes par cohorte
  (réussi les deux ; réussi le premier, pas le second ; n'a pas réussi le premier), comparé d'une
  cohorte à l'autre.

## 7. Hors de ce cadrage

Aucun code. L'onglet « Tendances » reste tel quel dans l'aperçu, sans fusion. Les cartes d'Études ne
sont pas touchées. Ce que chaque source permet exactement (les archives surtout) reste à mesurer avant
de promettre une comparaison.
