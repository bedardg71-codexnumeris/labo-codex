# Cadrage — Comparer des groupes : l'outil d'étude du Labo (12 nov. 2026, v11)

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

⚠ **Mot remplacé en v11 : « étude » devient « question »** (§ 1 quater, « Les mots »). Le texte
ci-dessous et la suite du cadrage gardent « étude » là où il a été écrit ; lire « question ».

**Une étude** (mot confirmé par Grégoire, v4 ; remplacé en v11) : cette unité — une hypothèse, ses observations, sa
conclusion. Le mot existe déjà dans le Labo (« Études ») ; il prend ici son sens plein. Son fondement,
dans les mots de Grégoire : un·e enseignant·e est avant tout un·e apprenant·e, et l'application le
soutient en lui permettant d'observer les effets de ce qu'il ou elle fait.

**Le microscope** (nom de TRAVAIL, v4) : l'instrument où l'on observe les micro-données, puisque toute
l'application repose sur elles. On y mène des études. Deux mots, deux choses : le microscope est
l'instrument ; l'étude est la démarche qu'on y conduit.

Conséquence assumée par Grégoire : il y aura des réaménagements, peut-être des sections à redécouper.
On raffine les outils ET la cohésion qu'ils ont entre eux. Rien de cela n'est engagé ici.

### 1 quater. Ce que la démarche prétend, et ce qu'elle ne prétend pas (12 nov., 2e séance — v11)

Grégoire : « Je ne suis pas un chercheur. Je suis un praticien. […] Je ne veux pas jouer aux apprentis
sorciers. Je veux que la démarche proposée par l'application soit cohérente et solide, mais je ne
prétends pas à la recherche scientifique. » Question née de la chronique de Paul Kirschner du 12 nov.
2026 (« Everyone's a learning scientist these days… apparently »), qu'il juge légitime.

**Le paragraphe à garder (Claude Code, retenu par Grégoire)** :

> La question n'est pas de se conformer à la démarche scientifique, que l'outil ne peut pas porter : pas
> de groupe témoin, de petits effectifs, un seul observateur qui est aussi l'acteur. Elle est de rendre
> l'enquête honnête, c'est-à-dire de protéger l'enseignant·e contre le biais le plus courant, celui de
> voir ce qu'on espère.

Ce que fait l'enseignant·e dans le Labo est une **enquête de praticien** (le praticien réflexif, la
recherche-action), pas de la recherche : elle vise une décision mieux éclairée dans son propre cours,
et peut affirmer « voici ce que j'ai observé chez moi, et ce que j'en fais », pas « ceci cause cela ».
Les mots sont choisis à cette hauteur (ci-dessous, « Les mots »).

**Les cinq garde-fous d'une enquête de praticien (retenus tous les cinq par Grégoire, 12 nov.)** —
chacun répond à une façon précise de se tromper soi-même :

| Garde-fou | Ce contre quoi il protège | Ce que l'application ferait |
|---|---|---|
| **1. Écrire l'attente avant** | ajuster l'hypothèse à ce qu'on a vu | dater l'hypothèse, compter les cohortes venues après (§ 6 quater) |
| **2. Dire d'avance ce qui me donnerait tort** | une hypothèse que tout confirme | un second texte dans l'étude, écrit avec l'hypothèse |
| **3. Nommer les autres explications** | attribuer l'effet à son changement alors que le groupe, la saison ou un autre changement suffisent | proposer ce qu'elle constate : les autres changements entre les mêmes trimestres, la saison, la taille des groupes |
| **4. Tout montrer, y compris ce qui manque** | ne regarder que les cohortes favorables, ou que les étudiant·es resté·es | afficher toutes les cohortes de l'étude, et le compte de ceux et celles qu'on ne voit pas (abandons, notes non saisies) |
| **5. Conclure provisoirement** | tirer une leçon d'un seul trimestre | dater chaque conclusion, afficher sur combien de cohortes elle repose, la laisser reprendre |

- **Qui les tient** : les 1, 4 et 5 sont mécaniques, l'application les tient seule. Les 2 et 3 demandent
  d'écrire : l'application invite, l'enseignant·e écrit (§ 5).
- **Le 2 répond à une question laissée ouverte au rapport** (« qu'est-ce qui confirmerait l'hypothèse de
  l'étude n° 1 ? »), retournée : qu'est-ce qui l'infirmerait ? La réponse pour l'étude n° 1 reste à écrire
  par Grégoire.
- **Une frontière mince avec le § 5** (« l'écran ne commente ni les données ni l'échantillon ») : les 3 et
  4 s'en approchent. Lecture de Claude Code, non contredite : un compte d'absent·es ou une liste de
  changements constatés sont des faits, pas des jugements. À surveiller au moment d'écrire les écrans.
- **Leur limite** : ils réduisent l'aveuglement, ils ne donnent pas la preuve d'une cause. Aucun ne
  remplace un groupe témoin.
- **Un sixième, hors de ce cadrage** : le regard d'un·e collègue, qui tient lieu de relecture par les
  pairs. Grégoire : il émergerait d'une éventuelle communauté de pratique.

**Les mots (tranchés par Grégoire, 12 nov. — « tout est toujours provisoire »)**. Le critère : un mot
pose problème s'il promet plus que ce que l'outil livre.

| Mot | Décision | Motif |
|---|---|---|
| Labo | gardé | un nom de lieu, au sens courant : on y essaie des choses |
| Observations | gardé | c'est exactement ce qu'on fait |
| **Hypothèse** | **retiré des libellés, déplié en deux phrases** (ci-dessous) | « hypothèse » pourra figurer entre parenthèses si on veut clarifier (Grégoire) |
| **Étude** | **remplacé par « question »** | Grégoire : « c'est le terme qui m'a toujours le plus embarrassé ». En recherche, il promet un protocole et un résultat qui fait autorité. |
| **Conclusion** | **remplacé par « ce que j'en retiens »** | « conclusion » dit quelque chose de clos et contredit le garde-fou 5 |

- **Pourquoi « question »** : le § 4 l'employait déjà (colonne « Question d'enseignant·e »). Poser une
  question n'affirme aucun résultat, et une question peut rester ouverte. Le Journal aurait un volet
  « Mes questions » ; chacune porte ce qui est attendu, ce qui donnerait tort, ce qu'on observe, ce
  qu'on en retient. Écartés : « essai », « enquête », « expérience ».
- **Une faiblesse mesurée** : le Journal contient aussi le questionnaire du bilan, adressé aux
  étudiant·es (`questionnaireBilan`). « Mes questions » et « questionnaire » voisineraient avec deux
  sens. À traiter au moment d'écrire les écrans.

**Les cinq temps d'une question, à la première personne (retenus par Grégoire, 12 nov.)** :

| Temps | Libellé | Ce qu'il porte |
|---|---|---|
| 1 | **Ce que je m'attends à voir** | l'hypothèse (le mot peut suivre entre parenthèses) |
| 2 | **Ce qui me donnerait tort** | le garde-fou 2 |
| 3 | **Ce que j'observe** | le renvoi vers Observations |
| 4 | **Ce qui pourrait l'expliquer autrement** | le garde-fou 3 |
| 5 | **Ce que j'en retiens** | l'ancienne « conclusion », datée et reprenable |

- **Pourquoi « m'attendre à voir »** et non « attendre » : « ce que j'attends » peut se lire comme un
  souhait ; « m'attendre à voir » oblige à nommer quelque chose d'observable. Avec le temps 2, les deux
  phrases font le travail du mot « hypothèse », et l'exigent davantage que lui.
- **Le « je »** (Grégoire) : ces phrases qui parlent à la place de l'utilisateur·trice mettent dans une
  position de praticien réflexif.
- **Une règle de voix proposée par Claude Code, non contredite** : l'application dit « tu » quand elle
  propose (elle tutoie déjà : « Ce que tes seuils donnent sur ton groupe ») ; le Journal dit « je »
  parce que c'est l'enseignant·e qui y écrit. C'est le § 5, rendu visible par la grammaire.
- **Ouvert** : le temps 4 est-il un champ à part, ou une invitation à l'intérieur du temps 5 ? Cinq
  champs peuvent peser sur qui veut seulement noter une intuition.
- Entre nous, dans ce cadrage, « hypothèse » reste le mot commode pour désigner le temps 1.
- **Où est le vrai risque (inférence de Claude Code)** : moins dans les noms que dans les verbes
  employés à la sortie de l'application (« prouve », « démontre », « confirme »), le jour où une
  question se partage.

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
- **Labo › Comparateur** (affiché « Exploration ») : autre chose. Il compare des PRATIQUES de notation.
  **Corrigé en v11** : il a deux sources, des profils-types générés ET le groupe actif réel
  (`js/comparateur-pratiques.js`, source `'reel'`). Grégoire : il sert à explorer des pratiques avant
  de les mettre en œuvre, mais aussi à comparer des pratiques déjà mises en œuvre.
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
- **Le partage des rôles (Grégoire, 12 nov. — v10) : l'application propose, l'enseignant·e écrit.**
  L'application soutient la réflexion et la pratique : elle soulage d'une charge mentale (rassembler,
  disposer, constater ce qui a changé), mais **la réflexion ne se délègue pas**. C'est une des raisons
  pour lesquelles il n'y a pas d'IA dans l'application, pour l'instant. Les décisions précédentes en
  découlent : l'écran ne commente pas les données, et il ne conclut pas à la place de l'enseignant·e.

## 6. Ce qui reste à trancher (à Grégoire)

1. ~~Par quoi commencer ?~~ **Tranché (v2)** : la n° 1, puis les jetons et le changement de méthode.
1 bis. ~~Que note le journal ?~~ **Tranché (v3)** : l'hypothèse, l'observation, la conclusion (§ 1 ter).
   ~~Reste : où vit-il ?~~ **Tranché (v11)** : dans le Journal (§ 6 quater).
2. **Une tension à nommer.** La carte « Dynamique des corrélations » calcule un r et s'impose un minimum
   d'étudiant·es ; la décision du 11 nov. a retiré du lot « Tendances » le lien calculé et tout jugement
   sur l'échantillon. Les deux ne se contredisent pas forcément (un r décrit, il ne juge pas), mais si
   Études rejoint l'outil, il faudra dire laquelle des deux règles gouverne.
3. ~~Le nom de l'outil, et sa place.~~ **Tranché (v11)** : ni sous-section neuve, ni « microscope » au
   menu. Études et Suivi longitudinal se fondent dans « Observations » (§ 6 quater).
4. ~~Le sort de l'onglet « Tendances ».~~ **Tranché (v11)** : il déménage dans Observations.
5. **Ouvert (v11)** : le nom d'« Exploration », qui dépend de la façon dont on situe la comparaison de
   pratiques par rapport à Observations.

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
- **Forme retenue par Grégoire (v8, après un aller-retour)** : les deux COHABITENT à l'écran, **le nuage
  d'abord, le tableau ensuite — le tableau est une LECTURE du nuage.** Le nuage est l'observation : il
  montre où se situe chaque personne. Le tableau en est la réduction au seuil de réussite, la seule
  lecture qu'on s'autorise à comparer d'une cohorte à l'autre pour l'instant. La nuance du nuage se lit
  avec prudence et ne s'extrapole pas (« le nuage offre une nuance que le tableau en colonnes n'offre
  pas »). L'ordre reprend le cycle : on observe, puis on lit, puis on conclut.
- **Le raisonnement qui y mène** : la mesure de l'étude n° 1 est « a réussi / n'a pas
  réussi », dans chacun des deux cours. Le nuage, lui, place la note exacte du cours suivant : il montre
  donc plus que ce qu'on s'autorise à lire. La lecture juste serait un tableau de comptes par cohorte
  (réussi les deux ; réussi le premier, pas le second ; n'a pas réussi le premier), comparé d'une
  cohorte à l'autre.

## 6 ter. Le journal des changements (v9)

**Ce sur quoi il repose (Grégoire, 12 nov.)** : pas seulement sur les résultats observés, mais sur
**l'alignement constructif du cours** (ses objectifs, ses activités, leur ordre) et sur **les systèmes
qu'il met en place** (la pratique alternative de notation, les jetons). La carte d'alignement et le
comparateur de pratiques peuvent donc servir à cette observation.

**Ce que l'application garde déjà, par trimestre (lu dans `trimestres.js`, `CLES_NAMESPACEES`)** :
- la carte d'alignement : `planification_mindmap`, `planification_seances` ;
- les systèmes : `pratiquesConfigurables`, `modalitesEvaluation` (les jetons sont un réglage de la pratique) ;
- le bilan : `questionnaireBilan`, `resultatsBilan`, `parcoursBilan`, `autoreflexionBilan`.

**Ce que ça ouvre** : chaque trimestre porte un ÉTAT du cours. Un changement est une différence entre
deux états, et l'application peut la voir sans qu'on la lui déclare (une activité déplacée, un jeton
ajouté, une pratique remplacée). Le journal aurait donc deux sources : ce que l'application CONSTATE
entre deux trimestres, et ce que l'enseignant·e en DIT — pourquoi ce changement, ce qu'il ou elle en
attend. (À mesurer avant de promettre : ce que ces deux états permettent réellement de comparer.)

**Qui tient la plume (tranché, v10)** : les deux. L'application PROPOSE les différences qu'elle
constate entre deux trimestres ; l'enseignant·e ÉCRIT — retient ce qui compte, dit pourquoi, dit ce
qu'il ou elle en attend.

**Deux regards, deux moments** : le comparateur de pratiques regarde AVANT (sur des profils-types, ce
qu'une autre pratique donnerait) ; le microscope regarde APRÈS (sur les vrais groupes, ce qui s'est
passé). Une étude peut s'ouvrir sur le premier et se conclure sur le second.

## 6 quater. La place dans le Labo (v11 — Grégoire, 12 nov., 2e séance)

**Le Labo, tel qu'il se dessine : Observations · Journal · Exploration · Outils.** Quatre sous-onglets
au lieu de sept, tous liés à l'expérimentation. Grégoire : « n'hésitons pas à renommer et déplacer les
concepts que représentent les onglets ». Les noms pourront être repris.

| Aujourd'hui | Devient | Ce qu'on y fait |
|---|---|---|
| Études + Suivi longitudinal | **Observations** | on regarde ce qui s'est passé : le cours suivant, les corrélations, les jetons. On n'y écrit pas. |
| Bilan | **Journal** | on réfléchit et on écrit. Trois volets : le bilan du trimestre, les changements entre trimestres, les questions (dites « études » jusqu'à la v11). |
| Exploration | Exploration (nom en suspens) | on compare des pratiques, simulées ou appliquées au groupe réel |
| Observation | **Outils** | on règle les lentilles : affichages, seuils, paramètres d'analyse |
| Modélisation | part vers Suivi › Animation | (Animation sera réaménagée avec les trois outils qu'elle contient) |
| Rythme | part vers Évaluation | c'est un outil de gestion du temps d'évaluation, pas d'expérimentation |

- **Pourquoi « Outils »** (mesuré) : le sous-onglet « Observation » ne contient que des préférences
  d'affichage, des paramètres d'analyse et des seuils ; son titre de page est déjà « Outils
  d'observation ». Grégoire : des réglages, des filtres, des lentilles à travers lesquels on regarde.
- **Pourquoi « Journal »** : le bilan est un MOMENT (après le trimestre) ; le lieu accueille aussi
  l'inter-trimestres et les études. Le mot reprend le § 1 ter. « Codex » écarté : il désigne déjà un
  des quatre concepts de données.
- **Où se forment l'hypothèse et la conclusion (Grégoire)** : le bilan réflexif (post-trimestre) et
  les changements observés (inter-trimestres) sont les lieux où l'on réfléchit à la pratique à moyen
  ou long terme. C'est là que se forment à la fois les hypothèses et les conclusions, dans un
  mouvement itératif : réflexion, observation, réflexion.
- **L'étude : un seul objet, deux portes.** Elle s'écrit dans le Journal (nom, hypothèse datée, renvoi
  vers la ou les observations, conclusions datées et reprenables). Depuis Observations, on voit
  quelles études portent sur ce qu'on regarde, et on retourne au Journal pour conclure. L'étude ne
  copie pas les données : elle les montre à jour.
- **« Avant de voir les données »** : non imposé, mais tracé. L'hypothèse est datée, et l'écran compte
  les cohortes arrivées depuis, sans commenter (§ 5). Accepté par Grégoire « pour l'instant ».
- **Une tension gardée** : une hypothèse peut naître en regardant, devant un nuage qui surprend.
  L'écriture étant au Journal, ce cas demande un aller-retour.
- **Supposé par Claude Code, à confirmer au moment de coder** : une étude traverse les trimestres,
  donc elle se range hors du trimestre, comme le registre.
- **Conséquence** : la tension du § 6, point 2 (le r calculé et son minimum d'étudiant·es, face à
  « l'écran donne des comptes ») n'est plus conditionnelle, puisque les corrélations rejoignent
  Observations. Elle reste à trancher.
- **Zone protégée** : ces renommages touchent `js/config.js` et `js/navigation.js`. Rien n'est engagé.

## 6 quinquies. Ce que les sources permettent — mesuré le 12 nov. (lecture seule)

Les trois mesures que le rapport demandait « avant de promettre ».

| Question | Verdict | Source |
|---|---|---|
| La marque d'un jeton est-elle dans les copies du registre ? | **Oui** | la marque est une propriété de l'évaluation, et le registre copie les évaluations entières (`js/registre-longitudinal.js`, `copie()` et `construireDossier`) |
| Les deux états du cours se comparent-ils entre trimestres ? | **Oui, tant que le trimestre vit dans l'application** | carte, séances, pratiques, modalités et bilan sont rangés par trimestre, lisibles par `cleSource` sans changer de trimestre actif (`js/trimestres.js`) |
| Un fichier d'archives (codex data) permet-il la même chose ? | **En partie seulement** | voir ci-dessous |

- **Jetons, deux limites** : la copie du registre est figée à sa date (un jeton appliqué après n'y est
  pas tant qu'on n'a pas fait « Refaire la copie ») ; et il y a TROIS sortes de jetons, pas une
  (`jetonDelaiApplique`, `jetonRepriseApplique`, `jetonRepriseCibleeApplique`). Le facteur « a utilisé
  un jeton ou non » devra dire lequel.
- **Où se perd l'information des archives (fait, `js/codex-data.js`, `_construireBibliotheques` et
  `_retirerBibliothequesDuGroupe`)** : à l'EXTRACTION, pas à l'archivage. Quand un fichier codex data
  réunit plusieurs trimestres, les grilles, échelles, productions et pratiques sont prises dans
  l'archive la plus récente seulement, puis retirées de chaque groupe. Les pratiques de chaque
  trimestre ancien n'y sont donc plus : le journal des changements ne pourrait pas y constater « la
  pratique a changé ».
- **Ce que ça laisse espérer (inférence, à vérifier sur une vraie archive)** : chaque archive d'origine
  porterait encore ses propres pratiques, puisque l'extraction les lit dans le `donnees.json` de
  chacune avant de n'en garder qu'une. Le stock de Grégoire serait donc intact, et seule l'extraction
  serait à revoir.
- **Non mesuré** : si une archive emporte la carte d'alignement et les modalités (le code laisse passer
  toutes les autres clés, mais aucune vraie archive n'était sous la main) ; et combien de trimestres
  vivent encore dans l'application de Grégoire.
- **Décision de Grégoire (12 nov.)** : s'il le faut, on revoit comment les archives sont créées. « Le
  but des archives est de pouvoir servir plus tard. Si le traitement actuel nous prive de certaines
  informations qui devraient se retrouver dans les archives, nous allons revoir les archives. » Le
  moment est bon : il est à peu près le seul à avoir plusieurs trimestres, et le seul à avoir des
  archives. ⚠ Ses archives sont ses données réelles : toute réécriture du stock remonte à lui.
- **La voie sûre en attendant (inférence)** : le journal des changements s'appuie sur les trimestres
  encore présents dans l'application, pas sur les fichiers d'archives.
- **Une trouvaille, disposition « inscrire et continuer »** : le mot « journal » est déjà pris dans le
  code. `js/journal.js` est le journal de bord des productions (la trace de chaque évaluation, rangée
  dans `evaluation.journal[]`). Ce n'est pas un écran du Labo ; le nom du sous-onglet peut tenir, il
  faudra distinguer les deux au moment de coder.

## 7. Hors de ce cadrage

Aucun code. L'onglet « Tendances » reste tel quel dans l'aperçu, sans fusion. Les cartes d'Études ne
sont pas touchées. Ce que chaque source permet exactement (les archives surtout) reste à mesurer avant
de promettre une comparaison.
