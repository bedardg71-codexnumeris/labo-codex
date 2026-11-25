# Rapport : « Tampons d'observation », lot 3 — sur une production (25 novembre 2026)

> Claude Code, sur le Mac, branche `lot/tampons-observation-3-production`, partie de `lot/tampons-observation-2-observer`
> (`c7db591a8`), arbre `../labo-codex-tampons-production`. Consigne : Cowork, « Gestion des pratiques de notation 5 »,
> 25 nov., 5 h 50 ; décisions de Grégoire du 25 nov. (5 h 39, 5 h 40, et 8 h 22 pour la retouche « plusieurs cibles », § 3 bis). **Rien n'est en ligne** : aucun bump, aucune ligne de
> Nouvelles, rien dans `main`. **Aperçu** : https://deploy-preview-62--codexnumeris-051225.netlify.app (demande n° 62, en
> brouillon, « APERÇU, ne pas fusionner » ; elle porte les lots 1, 2 et 3).

**Fait.** Un tampon d'observation posé sur une production se lit aussitôt au profil, section « Cibles » : sous sa production, à la date de la pose, et sous la cible quand la production n'en vise qu'une. « Inscrire pour une production » montre ces tampons dans le bloc de chaque cible, avant le niveau ; ceux qui sont retenus sont copiés dans l'inscription. **Retouche du 25 nov., 8 h 22 (§ 3 bis)** : une seule cible offerte, tous retenus d'office ; plusieurs, aucun, sauf le tampon qui porte un critère de la cible. Poser un tampon n'écrit aucune inscription. Vert sous WebKit et Chromium (18 essais sur 18 chacun), Vitest complet vert (12 433), 26 break-tests rouges sur 26.
**Ce qui contredit la consigne** : rien dans les mesures a) à d). Trois points que la consigne ne tranchait pas et que j'ai tranchés (§ 3) : 1. avec plusieurs cibles, chaque bloc recevait d'office tous les tampons (**renversé par Grégoire à 8 h 22**, § 3 bis) ; 2. un tampon posé APRÈS l'inscription ne rejoint plus la cible (seulement la production) ; 3. « aussitôt » veut dire au plus 2 secondes (le délai d'enregistrement d'Annoter, non touché).
**Fichier d'essai (25 nov., session du nuage, consigne de 9 h 45 ; § 9 réécrit, § 10 neuf)** : `departs/ESSAI-tampons-observation-lot-3.zip`, servi par l'aperçu à `/departs.html` ; un banc l'ouvre et joue l'essai (Chromium seulement). Aucun code de l'application n'a changé. Cinq pièces d'essai à retirer avant la fusion (§ 10).
**Ce qui reste** : l'essai de Grégoire sur l'iPad (§ 9, à partir du fichier d'essai), la page de textes (`TEXTES-2026-11-25-tampons-observation-lot-3.md`, quatre questions), la place du rang « Sur ses productions », proposée sur capture (§ 4). Pas de verdict WebKit complet : rien ne part en ligne.
**Retouche du 25 nov., midi (session du nuage, consigne de Cowork après l'essai de Grégoire sur l'iPad, § 11)** : deux textes de « Inscrire pour une production » changent (I2 : les noms retenus sur leur ligne, sous les tampons ; I4 : une seconde phrase dans le bloc au tampon à critère). Les autres textes sont acceptés. #1311 à #1314 inscrits. Le § 9 (groupe 1) et le § 10 b) sont corrigés : l'onglet privé n'est pas un geste sûr sur l'iPad. Chromium vert, Vitest complet vert ; **rien n'a tourné sous WebKit** (absent du conteneur).

---

## 1. Les mesures faites avant de coder

### a) Ce que coûte la lecture à l'ouverture du profil

- **LU** : les annotations vivent dans `annotationsTravaux` (clé du trimestre), lue par `db.getSync`, **synchrone**. Au-dessus de 25 000 caractères, la valeur vit en mémoire (`memoryCache`) et `getSync` rend la référence, sans rien décoder ; en dessous, elle est relue de `localStorage` (`js/db.js:1645`, seuil `:120`).
- **VU** (WebKit et Chromium, le vrai `index.html`, 30 étudiant·es × 10 productions de 4 pages, 3 tampons par page) : lire les tampons des dix productions d'un·e étudiant·e prend **moins de 1 ms** (médiane sous le seuil de mesure ; maximum 1 ms sous WebKit, 0,2 ms sous Chromium), que la liste pèse 2 millions de caractères (peu de traits) ou 138 millions (25 traits de 80 points par page). Script jetable, non commité.
- Le profil ne lit que les fichiers d'UN·E étudiant·e. Aucune forme de repli n'est nécessaire : « une seule source » tient telle quelle.

### b) Ce que « Inscrire pour une production » sait

- **LU** : la fenêtre connaît l'étudiant·e (son DA), la production (son identifiant) et la date. Elle ne lisait ni fichier ni annotation.
- **VU** : avec ces deux identifiants, les tampons se lisent **sans ouvrir la production** : `fichiersTravaux` (par DA, production et groupe-cours actif), puis l'annotation par `fichierId`. Les tampons paraissent dès que l'étudiant·e ET la production sont choisis.

### c) Plusieurs pages, sans page annotée, sans fichier

| Cas | Ce que ça donne | Preuve |
|---|---|---|
| Plusieurs pages | Toutes les pages sont lues (`annotation.pages` est rangé par rang de page) | VU : un tampon à la troisième page se lit |
| Deux fichiers pour la même production (une reprise) | Réunis sous la production | Vitest B |
| Production ouverte, jamais annotée (`pages` vide) | Rien, aucune erreur | VU |
| Fichier sans annotation | Rien | Vitest B |
| Ligne de tableau sans fichier (production non importée) | Rien à lire : aucun tampon ne peut y avoir été posé. Aucune carte au profil ; « Inscrire pour une production » est celui d'avant | VU (une étudiante sans fichier) |
| Tampon posé, puis page retirée dans l'éditeur de pages | Les annotations suivent leur page (#1075) ; une page retirée emporte ses tampons, donc ses traces | LU seulement |

### d) La simulation (`lot/pratique-en-simulation` = `28b3d1293`, lue sans y toucher)

- **LU** : le profil lit la pratique DÉSIGNÉE du groupe (`designerPratiqueActive`), jamais la pratique simulée. Les traces lues en direct y paraîtraient donc sous les cibles de la pratique officielle, si elle est par cibles ; si elle ne l'est pas, la section « Cibles » n'existe pas et rien ne paraît, même avec une simulation par cibles ouverte.
- **LU** : le tableau « Simulation » a son propre « Inscrire pour une production » (même fonction, contexte de la simulation). Il montrerait les mêmes tampons et les copierait dans la clé réelle du trimestre, sous l'ensemble de la pratique simulée, comme toute inscription faite en simulation (rapport de mesure, point 7).
- **LU** : `production.ciblesRenseignees` porte des identifiants de cibles d'UN ensemble. Sous une pratique simulée d'un autre ensemble, « vise une seule cible » ne reconnaît aucune cible (la cible déclarée n'est pas dans l'ensemble) : la trace reste sous la production.
- **À prévoir à la fusion** : les deux branches modifient `ouvrirParProduction`, `_inscrireProduction` et `_ciblesDeLaProductionHTML` (`js/tableau-cibles.js`). Conflit de texte attendu, sans conflit de sens : la simulation ajoute un argument `base`, ce lot ajoute les tampons.

### La date retenue

**L'instant de la pose.** Il est écrit dans l'identifiant du tampon posé (`STK_<millisecondes>`, `js/travaux-annotation.js:1292`), gardé quand on déplace le tampon ; un tampon collé reçoit l'instant du collage. C'est la date la plus proche du geste. La trace est datée du jour de cet instant, à l'heure de l'appareil. Replis, pour un identifiant sans instant (aucun cas trouvé dans le code actuel) : la dernière modification de l'annotation, puis l'import du fichier. Écartées : la date de l'évaluation et la date de remise, qui ne disent pas quand l'enseignant·e a posé le tampon.

## 2. Tout ce qui lit les tampons d'une production

| Qui | Quoi | Touché par ce lot |
|---|---|---|
| `travaux-annotation.js` | La pose, le dessin, l'enregistrement | Non |
| `evaluation-retroaction.js` → `travauxOutils.observationsDesTampons` | Ce que lit l'étudiant·e (rétroaction générale et spécifique) | Non |
| `travaux-export-pdf.js` | Le PDF annoté et la synthèse | Non |
| `actions-rlo.js` | Le compte des actions RLO | Non |
| **`tableau-cibles.js` → `tracesDesProductions(da)`** | **NEUF** : le seul lecteur du lot. Il lit `fichiersTravaux` et `annotationsTravaux` par `travauxStockage`, et passe à `InscriptionsCibles.tracesDesProductions` (fonction pure) | Oui |
| `profil-cibles.js` | Appelle le lecteur ci-dessus ; ne lit aucune annotation lui-même | Oui |
| « Inscrire pour une production » | Appelle le même lecteur | Oui |

**Écrit** : rien de neuf. Le seul écrivain d'inscriptions reste `InscriptionsCibles.inscrire` ; « Inscrire pour une production » lui passe maintenant `tampons` (il passait `[]`). **Source ou stock** : seule la source change ; aucune donnée déjà écrite n'est touchée, aucune clé neuve.

## 3. Ce que j'ai tranché, et ce que j'ai supposé

| N° | Décision | Ce que j'ai supposé |
|---|---|---|
| 1 | **REMPLACÉE par la décision de Grégoire du 25 nov. 2026, 8 h 22** (§ 3 bis). Une seule cible offerte : ses tampons sont retenus d'office. Plusieurs : aucun n'est retenu d'office, on touche sous chaque cible ceux qui la concernent ; exception, un tampon qui porte un critère est déjà retenu sous la cible qui porte ce critère | Ma décision d'origine (« chaque bloc montre tous les tampons, retenus d'office ») copiait le même tampon sous deux cibles sans geste : renversée |
| 2 | **« Rien ce jour-là »** : la cible ne reçoit rien, tampons compris. « Aucun niveau » avec des tampons : une trace sans niveau (un tampon seul suffit, lot 2) | |
| 3 | **Un tampon posé après l'inscription** ne paraît plus sous la cible (l'inscription y est seule, comme tranché par Cowork) ; il paraît sous la production | Que c'est assumé. Pour l'y faire entrer, on inscrit de nouveau |
| 4 | **Une inscription annulée** rend la lecture en direct sous la cible | Que « non annulée » le veut |
| 5 | **« Vise une seule cible »** : exactement une cible déclarée ET cette cible est encore dans l'ensemble de la pratique | Qu'une cible déclarée mais retirée de l'ensemble ne compte pas |
| 6 | **Sous la cible, le profil seulement.** La fenêtre d'une case du tableau et son ✎ ne montrent pas la lecture en direct | Que la décision de 5 h 40 vise le profil. La case reste ce qu'elle était tant que rien n'est inscrit |
| 7 | **Un jour, une trace** : par production et par jour de pose, chaque tampon une fois (comme une inscription ne garde qu'une fois le même tampon) | Qu'un tampon posé trois fois le même jour est une seule trace, sans compte |
| 8 | **Masqué n'est pas retiré** : un tampon ou une catégorie retirés de la palette restent lus sur les productions où ils sont déjà posés ; « Observer », lui, ne les offre plus (lot 2) | Que masquer ne retire rien d'une production (rapport de mesure, point 3) |
| 9 | **Supprimé** : un tampon créé puis supprimé n'est plus lu en direct. J'ai fait lire la liste RANGÉE des tampons, pas la liste en mémoire, qui le gardait jusqu'au rechargement | Que la trace doit être la même avant et après un rechargement |
| 10 | **La marque « pas encore inscrite »** sur une trace lue sous une cible, avec un bord en tirets | Que la liste « Toutes les inscriptions » ne doit pas faire passer une trace lue pour une inscription (question P4 de la page de textes) |
| 11 | **Dans la fenêtre, les tampons sont au-dessus des niveaux**, visibles avant tout choix, et non à côté de leur critère : les critères ne paraissent qu'une fois un niveau choisi | Que « voir les tampons au moment d'attribuer le niveau » passe avant « à côté du critère ». Une fois inscrits, ils se lisent à côté de leur critère (lot 2) |
| 12 | **Changer d'étudiant·e** dans la fenêtre remplace les tampons et garde les niveaux, coches et textes déjà saisis | |

**« Aussitôt »** (LU) : Annoter enregistre 2 secondes après le dernier geste, et tout de suite quand on quitte l'écran (`travaux-annotation.js:20`, `:282`). Le profil lit ce qui est enregistré : la trace y est dès qu'on y arrive. Je n'ai pas touché à ce délai.

## 3 bis. La retouche du 25 nov., 8 h 22 : une production qui vise plusieurs cibles

Consigne de retouche de Cowork, sur le texte accepté par Grégoire : « Quand la production vise une seule cible, ses tampons sont retenus d'office sous cette cible. Quand elle en vise plusieurs, aucun tampon n'est retenu d'office : je touche, sous chaque cible, ceux qui la concernent. Une exception : un tampon auquel j'ai donné un critère est déjà retenu sous la cible qui porte ce critère. »

**La règle, en une fonction pure** : `tamponsRetenusDOffice(tampons, cible, nombreDeBlocs)` (`js/pratiques/inscriptions-cibles.js`). La fenêtre lui passe le nombre de blocs de cible qu'elle offre.

**Mesuré pour « aucune cible déclarée »** (LU dans `ciblesOffertes`, VU au banc) : la fenêtre offre alors **toutes les cibles de l'ensemble**, dans leur ordre. Il en va de même quand aucune des cibles déclarées n'est encore dans l'ensemble. La règle s'applique au nombre de blocs : un ensemble de deux cibles ou plus, rien n'est retenu d'office, sauf par un critère ; un ensemble d'une seule cible, un seul bloc, tout est retenu.

**Les six points tranchés par Cowork : aucun n'est contredit par le code.**

| Point | Ce que le code fait |
|---|---|
| 1. Le nombre de blocs | Un bloc : tout retenu. Deux ou plus : rien, sauf l'exception. Jugé à `ciblesOffertes(...).length`, et au nombre de blocs à l'écran quand l'étudiant·e change |
| 2. L'exception | `tamponsRetenusDOffice` appelle `rapprocherTampons` du lot 2 (celle d'« Observer ») : texte rogné, espaces resserrées, sans égard à la casse. Aucune seconde comparaison (une sentinelle le lit). **Deux cibles qui portent un critère du même texte : le tampon est retenu d'office sous les deux** (Vitest G) |
| 3. Tous visibles | Chaque bloc montre tous les tampons ; un toucher retient, un second relâche ; un bloc ne change rien à l'autre |
| 4. Pas de trace vide | La règle du lot 2 tient sans retouche : « Aucun niveau » sans tampon retenu, sans texte et sans critère est refusé (`motifsRefus`, motif « vide »), le refus nomme la cible, rien n'est écrit, la fenêtre reste ouverte. « Rien ce jour-là » : la cible ne reçoit rien |
| 5. Le profil | Inchangé : `cibleUnique` n'est pas touchée |
| 6. La ligne d'aide | Deux textes : celui d'avant pour un seul bloc, la proposition de Cowork pour plusieurs (page de textes, I3 et I4) |

**Ce que j'ai tranché au-delà de cette consigne**

| N° | Décision | Ce que j'ai supposé |
|---|---|---|
| R1 | **La fenêtre et le profil ne comptent pas de la même façon, et je l'ai laissé.** La fenêtre compte ses blocs ; le profil exige exactement une cible déclarée. Deux cas s'écartent : une production sans cible déclarée dans un ensemble d'une seule cible, et une production qui déclare deux cibles dont une seule est encore dans l'ensemble. Dans les deux, la fenêtre offre un bloc et retient tout d'office, mais le profil ne lit pas la trace en direct sous la cible | Que le point 5 (« le profil ne change pas ») l'emporte. Cas rare ; à aligner si Grégoire le veut |
| R2 | **L'annonce A2** disait « remis dans l'inscription » : faux pour un premier toucher. Elle dit maintenant « retenu pour l'inscription de « cible » », dans les deux cas | Un seul texte suffit ; les mots restent à Grégoire (page de textes) |
| R3 | **Changer d'étudiant·e** redessine les tampons de chaque bloc selon la même règle : ce qui avait été touché pour l'étudiant·e d'avant n'est pas gardé (les niveaux, coches et textes le sont, comme avant) | Que les tampons d'une autre personne n'ont rien à garder |
| R4 | **La ligne des noms** (I2) dit « : aucun » tant que rien n'est retenu, puis les noms retenus. *Changé le 25 nov., midi (§ 11) : la ligne passe sous les tampons et dit « Retenus pour cette cible : aucun ».* | |
| R5 | **Un tampon retenu par son critère se relâche d'un toucher**, comme les autres | Que l'exception donne un départ, pas une obligation |

**La preuve de la retouche** (25 nov., un passage à la fois, en alternance avec une autre session)

| Suite | Moteur | Résultat |
|---|---|---|
| Banc du lot 3 (5 essais neufs, 1 remplacé) | WebKit | **18 sur 18** |
| Le même | Chromium (config jetable, retirée ; `playwright.chromium.config.js` du dépôt vise un conteneur, pas ce Mac) | **18 sur 18** |
| Sentinelle du lot 3 (section G neuve, 8 essais) | Vitest | **32 sur 32** |
| Vitest complet | | **12 433 sur 12 433** (961 fichiers) |
| Bancs des lots 1 et 2 | WebKit | **40 sur 40** |

Un rouge de mon fait, trouvé par Vitest complet et fini : j'avais daté d'aujourd'hui les jetons anti-cache des deux fichiers ; ils doivent porter le jour du build (23 nov., aucun bump). Remis, sentinelle verte.

Les voisins du tableau des cibles (23 essais du premier rendu) ne sont pas rejoués : la retouche ne touche que la fenêtre « Inscrire pour une production ».

| Essai demandé | Essai du banc |
|---|---|
| Une cible, tout retenu | « une seule cible : un seul bloc, tous les tampons retenus d'office… » |
| Deux cibles, rien de retenu ; inscrire sans rien toucher ne copie aucun tampon | « deux cibles, aucun tampon à critère… » |
| Deux cibles, un tampon à critère, retenu sous celle-là seulement ; toucher sous une cible ne copie que sous celle-là | « deux cibles, un tampon qui déclare un critère de l'une… » |
| Pas de trace vide | « deux cibles : « Rien ce jour-là » partout n'inscrit rien ; « Aucun niveau » sans tampon retenu… » |
| Aucune cible déclarée | « une production sans cible déclarée… » |

| N° | Mutation (chacune remet « retenu d'office », ou en retire la règle) | Rouge |
|---|---|---|
| B21 | plusieurs blocs retiennent tout, comme un seul | V : G (4) ; P : 4 essais |
| B22 | l'exception du critère est retirée | V : G (4) ; P : « …un critère de l'une… », « …sans cible déclarée… » |
| B23 | tout tampon est dessiné pressé | V : G ; P : 4 essais |
| B24 | la fenêtre annonce toujours un seul bloc | V : G ; P : 4 essais |
| B25 | au changement d'étudiant·e, la règle d'un seul bloc est rejouée | V : G ; P : « …sans cible déclarée… » |
| B26 | la phrase d'aide reste celle du retrait | P : « …aucun tampon à critère… », « …sans cible déclarée… » |

Six mutations, six rouges ; fichiers remis après chacune.

## 4. La place du rang « sous cette production » : proposition sur capture

**Mesuré d'abord** (LU, VU sur les captures du lot 2) : la section « Cibles » du profil a deux cartes, « Note du cours » et « Les cibles ». Ce qui vient d'une production n'y a pas de rang à soi : une inscription d'origine « production » est rangée sous sa cible, avec l'origine « Production : titre ». La section « Productions » du profil sert à toutes les pratiques : je n'y ai pas touché (« ailleurs, rien ne change »).

**Proposé et codé** : une troisième carte, « Sur ses productions », sous « Les cibles ». Une production par bloc (« Production : titre »), la plus récente d'abord ; dans chaque bloc, une entrée par jour de pose, dessinée comme une entrée de l'historique (la date, les tampons du lot 2). La carte n'existe que si une production porte un tampon d'observation.

Captures : `profil-sous-la-production-*.png` (la carte) et `profil-sous-la-cible-*.png` (la trace lue sous la cible). **À voir par Grégoire** : la carte sous « Les cibles », ou au-dessus ?

## 5. La preuve

| Suite | Moteur | Résultat |
|---|---|---|
| `tests/integration/tampons-observation-lot-3-production.spec.js` | WebKit | **14 sur 14** |
| Le même | Chromium (config jetable, retirée) | **14 sur 14** |
| `tests/unit/sentinelle-tampons-observation-lot-3-production.test.js` | Vitest | **24 sur 24** |
| Vitest complet | | **12 425 sur 12 425** (961 fichiers) |
| Bancs des lots 1 et 2 | WebKit | **40 sur 40** |
| Voisins : inscription par standards, parcours « Suivre ton groupe par cibles », démo « Par standards » | WebKit | 13 verts ; au premier passage, 1 instable vert à la reprise, non identifié (le second passage : 13 verts sans reprise) |
| Voisins : lots 3 et 4, « à l'essai » | WebKit | **10 sur 10** |

**Un rouge de mon fait, trouvé par Vitest complet et fini** : le cliquet de complexité (une fonction de plus au-dessus de 15, `_entreeHTML`). Les marques de l'entrée sortent en fonction ; le compte est revenu à 433. Les six break-tests touchés par ce découpage ont été rejoués.

### Les sentinelles attendues, et leur break-test

| Sentinelle de la consigne | Essai | Mutation → rouge |
|---|---|---|
| Un tampon posé paraît au profil sous sa production, sans autre geste | « un tampon posé pour de vrai… » (le vrai écran Annoter, un vrai clic) ; Vitest A, B | B7, B6 |
| Il disparaît du profil quand on le retire de la production | le même essai (« Effacer la page » et sa confirmation) | B7 |
| Une seule cible : aussi sous cette cible ; deux cibles ou aucune : sous aucune | « une production à une seule cible… », « …à deux cibles, ou sans cible… » ; Vitest C, D | B3, B8 |
| Après « Inscrire pour une production », une seule fois sous la cible, par l'inscription | « les tampons de la production se voient avant… » ; Vitest D | B4, B10 |
| Un tampon retiré avant d'inscrire n'entre pas dans l'inscription | le même ; « deux cibles : chacune voit les tampons… » | B5, B17 |
| Un tampon d'une catégorie non cochée ne paraît nulle part | « un tampon d'une catégorie non cochée… » ; Vitest B | B2, B11 |
| Poser un tampon n'écrit aucune inscription | « un tampon posé pour de vrai… » ; Vitest F | B1 |
| Hors pratique par cibles, rien ne change | « hors pratique par cibles… » (le profil comparé avec et sans tampon d'observation) | B15 |
| La rétroaction de l'étudiant·e est identique | « la rétroaction de l'étudiant·e : la même… » | B16 |
| (en plus) La date est celle de la pose ; plusieurs pages ; l'étudiant·e demandé·e seulement | Vitest A, B ; « plusieurs pages… » | B6, B14, B20 |
| (en plus) Lecture seule, la marque, l'échappement, le tampon supprimé, le changement d'étudiant·e | les essais du même nom | B18, B19, B9, B12, B13 |

**20 mutations, 20 rouges** (9 jugées par Vitest, 20 par WebKit). Chaque fichier est remis après sa mutation, arbre propre vérifié.

### Ce que j'ai VU

- La pose réelle d'un tampon en Annoter, son enregistrement, le profil, la fenêtre « Inscrire pour une production », l'inscription écrite : au navigateur, sous WebKit et Chromium, sur un groupe fictif.
- **La rétroaction** : `observationsDesTampons` rend la même chose, au caractère près, sur l'arbre du lot 2 (`c7db591a8`) et sur celui du lot 3, pour les mêmes tampons (essai jetable entre les deux arbres, WebKit).
- Les seize captures.

### Ce que j'ai LU seulement

- Que `evaluation-retroaction.js`, `travaux-export-pdf.js`, `travaux-annotation.js`, `travaux-stockage.js`, `js/config.js` et `js/navigation.js` ne sont pas modifiés (`git diff c7db591a8`, vide pour ces fichiers). Le PDF remis n'a pas été généré.
- La simulation (§ 1 d) et l'éditeur de pages (§ 1 c).
- Le contraste de la marque « pas encore inscrite » : les variables déjà employées (`--texte-secondaire`, `--bordure-moyenne`) ; rapport non mesuré.

### Ce qu'aucun banc ne joue

- L'iPad et Safari réels : le toucher des tampons dans la fenêtre, la hauteur utile en paysage.
- Le lecteur d'écran lui-même : les annonces sont écrites dans une zone `aria-live`, leur texte est vérifié, pas leur lecture.
- « Hors pratique par cibles, au pixel près » : j'ai comparé le HTML du profil (sections « Productions » et « Travaux soumis ») avec et sans tampon d'observation, pas des images entre deux arbres. Aucun fichier d'un écran hors cibles n'est modifié, sauf une fonction ajoutée à `travaux-outils.js`, que seuls les écrans des cibles appellent.

## 6. Les captures

Dans `plans de travail/captures-2026-11-25-tampons-observation-lot-3/` (WebKit, 1 px d'image pour 1 px CSS), chacune à 1180 × 820 et 820 × 1180, en clair et en sombre :
- `profil-sous-la-cible-*.png` : la trace lue sous la cible visée seule, sa marque, un tampon à côté de son critère ;
- `profil-sous-la-production-*.png` : la carte « Sur ses productions », deux productions ;
- `inscrire-pour-une-production-*.png` : les tampons dans le bloc de la cible, avant tout niveau ;
- `inscrire-un-tampon-retire-*.png` : un tampon retiré, un niveau choisi.

**Un défaut de mon premier rendu, vu à la retouche** : en portrait (820 × 1180), `profil-sous-la-cible-*` et `profil-sous-la-production-*` sont la même image, octet pour octet : la page n'a pas défilé entre les deux prises. Les deux cartes y sont visibles ensemble ; je ne les ai pas reprises.

Retouche de 8 h 22 (clair seulement, comme demandé) :
- `inscrire-deux-cibles-rien-de-retenu-*.png` : deux cibles, deux tampons sans critère, aucun retenu ;
- `inscrire-deux-cibles-retenu-par-son-critere-*.png` : le tampon qui porte un critère de la première cible, retenu sous elle seule.

## 7. Sécurité

- Le nom d'un tampon et le titre d'une production passent par `echapperHtml` au profil et dans la fenêtre (essai « sont du texte », break-test B9).
- Aucun gestionnaire inline : les tampons de la fenêtre sont des `data-tc`, suivis par l'écoute déjà posée.
- Aucun `console.log`. Aucun nom réel ; aucun tampon, catégorie ou critère fourni n'est nommé dans le code neuf ni dans les essais.

## 8. Trouvailles (trois issues)

| N° | Trouvaille | Issue |
|---|---|---|
| T1 | Un tampon créé puis supprimé reste dans la liste en mémoire jusqu'au rechargement (`chargerTamponsPersonnalises` ajoute, ne retire pas). VU | **Commenter et oublier** pour ce lot : ma lecture passe par la liste rangée (décision 9). Le fond relève du plan du 2 nov., non touché |
| T2 | Le signalement d'une autre session (`js/travaux-archivage.js`, vers la ligne 647 : la version annotée d'une production importée en image sortirait sans annotation) | **Ni reproduit ni infirmé** : je ne l'ai pas croisé et je ne l'ai pas rejoué. LU seulement : à cet endroit, le code dessine les annotations de la page 0 sur l'image |
| T3 | Un bandeau de jalon (« Tes premières évaluations sont enregistrées… ») et le rappel de sauvegarde couvrent le bas de l'écran pendant les bancs | **Commenter et oublier** : le harnais les écarte |

Aucune entrée au BACKLOG.

## 9. Les gestes d'essai pour Grégoire, à partir du fichier d'essai

> Réécrit le 25 nov. (consigne de Cowork de 9 h 45) par la session du nuage : l'essai part du fichier `ESSAI-tampons-observation-lot-3.zip` (§ 10). Chaque groupe de gestes a été joué par le banc `essai-tampons-observation-depart.spec.js`, sous Chromium, à 1180 sur 820. **(VU)** : le libellé ou le chemin a été vu à l'écran dans ce banc (capture ou lecture du texte affiché). Ce qui n'est pas marqué est décrit, pas cité. **Rien de ceci n'a été vu sur l'iPad ni sous Safari.**

**Ce que le fichier porte.** Le groupe « 601-101-MQ · gr. 00001 » (VU), quatre personnes : « Fictif-01, Personne-01 » à « Fictif-04, Personne-04 » (VU). Deux cibles : « Cible fictive A » et « Cible fictive B » (VU). Trois productions, nommées d'après ce qu'elles renseignent (VU). Trois tampons d'observation, « Tampon fictif 1 (critère A1) », « Tampon fictif 2 », « Tampon fictif 3 » (VU), et un tampon d'une autre catégorie, « Tampon fictif hors observation » (VU). Seules les deux premières personnes ont des images importées.

### Groupe 1 : ouvrir le fichier

1. Dans Safari, dans un onglet **ordinaire** (pas de navigation privée : sur l'iPad, les images du fichier n'y sont pas rangées, #1311), ouvre l'adresse `https://deploy-preview-62--codexnumeris-051225.netlify.app/departs.html`. Si la bande verte « Mode démonstration » est là, touche d'abord « Quitter la démo ». Sous « Essai : les tampons d'observation », touche « Télécharger le fichier », puis « Ouvrir l'application ». (Ces trois libellés sont ceux que j'ai écrits dans la page ; la demande de téléchargement de Safari, je ne l'ai pas vue.)
2. Dans l'application, touche « Codex » (VU), en haut à droite, puis « Ouvrir un codex… » (VU). Dans le sélecteur de fichiers de l'iPad, choisis le fichier téléchargé.
3. Si une fenêtre « Modèle antérieur détecté » (VU) s'ouvre, touche « Remplacer » (VU) : l'espace portait déjà des données. Puis une fenêtre « Recharger la page » (VU) paraît : touche « Recharger » (VU).

> **Corrigé le 25 nov., midi** : ce chemin (onglet ordinaire, « Quitter la démo » si la bande est là, « Ouvrir un codex… », « Remplacer », « Recharger ») est celui qui a marché pour Grégoire sur l'iPad. L'onglet de navigation privée, conseillé ici ce matin, n'y est PAS un geste sûr : à 10 h 59, l'écran d'Annoter y a affiché « Fichier manquant — rouvre le codex après avoir libéré de l'espace » (#1311).

**Tu dois voir** : sous les onglets, le groupe « 601-101-MQ · gr. 00001 » (VU) ; le bouton « Codex » avec un point vert (VU) ; aucune bande « Mode démonstration ». Si elle paraît après l'ouverture, la démo était active (#1312) : « Quitter la démo », puis rechoisis le groupe dans le menu sous les onglets. Ce que « Remplacer » laisse derrière lui : § 10, b).

### Groupe 2 : poser un tampon sur la production à une cible

1. Évaluation › Annoter (VU). Une liste de six lignes (VU) : sur la ligne « Fictif-01, Personne-01 » dont la production est « Production fictive : une cible », touche « Annoter » (VU).
2. L'image s'ouvre, elle dit « IMAGE FICTIVE (essai) » (VU). Dans la palette « Tampons » (VU), à droite, descends jusqu'à « Catégorie fictive (observation) » (VU) ; touche « Tampon fictif 2 », puis touche l'image.
3. Plus bas dans la même palette, sous « Catégorie fictive (autre) » (VU), touche « Tampon fictif hors observation », puis touche l'image ailleurs.

**Tu dois voir** : les deux tampons sur l'image (VU), et « Enregistré » (VU) en bas à gauche, de lui-même.

### Groupe 3 : relire au profil

1. Suivi › Profils (VU). Le menu des personnes est sur « Fictif-01, Personne-01 (2390001) » (VU).
2. Touche « Cibles » (VU).

**Tu dois voir** : en bas, la carte « Sur ses productions » (VU), avec « Production : Production fictive : une cible » (VU), la date d'aujourd'hui et « Tampon fictif 2 » seulement ; le tampon de l'autre catégorie n'est nulle part. Plus haut, sous « Cible fictive A », la même trace avec « pas encore inscrite » (VU). Rien sous « Cible fictive B ».

### Groupe 4 : inscrire, une cible

1. Évaluation › Tableau de notation (VU), puis « Inscrire pour une production » (VU).
2. Sous « Étudiant·e » (VU), choisis « Personne-01 Fictif-01 » ; sous « Production » (VU), « Production fictive : une cible ».
3. Touche le tampon : il se relâche. Touche-le de nouveau : il est retenu. Choisis « 3 Acquis » (VU), puis « Inscrire » (VU).

**Tu dois voir**, avant le geste 3 : un seul bloc, « Cible fictive A » ; sous « Tampons d'observation posés sur cette production » (VU, seule sur sa ligne), le tampon, déjà retenu (une coche, VU) ; sous lui, « Retenus pour cette cible : Tampon fictif 2 » (VU). Après le premier toucher, cette ligne dit « Retenus pour cette cible : aucun » (VU).

### Groupe 5 : relire encore

1. Suivi › Profils › « Cibles ».

**Tu dois voir** : sous « Cible fictive A », « Niveau retenu : 3 · Acquis » (VU) ; une seule entrée pour cette production, avec le niveau et « Tampon fictif 2 », sans « pas encore inscrite ». Sous « Sur ses productions », le tampon est toujours là.

### Groupe 6 : inscrire, deux cibles, le tampon à critère déjà retenu

1. Évaluation › Annoter. L'écran rouvre la dernière production (VU) : dans le menu des productions, en haut à gauche, choisis « Production fictive : deux cibles » (VU), puis touche le nom « Fictif-01, Personne-01 » (VU), à côté.
2. Pose « Tampon fictif 1 (critère A1) », puis « Tampon fictif 3 », comme au groupe 2.
3. Évaluation › Tableau de notation › « Inscrire pour une production » ; « Personne-01 Fictif-01 » et « Production fictive : deux cibles ».

**Tu dois voir** : deux blocs, « Cible fictive A » et « Cible fictive B » (VU) ; chacun montre les deux tampons. Sous A, « Tampon fictif 1 (critère A1) » est déjà retenu, et lui seul (VU) : la ligne sous les tampons dit « Retenus pour cette cible : Tampon fictif 1 (critère A1) » (VU). Sous B, rien n'est retenu : « Retenus pour cette cible : aucun » (VU). La phrase d'aide commence par « Touche les tampons qui concernent cette cible » (VU) ; sous A seulement, elle se termine par « Un tampon qui porte un critère de cette cible est déjà retenu. » (VU).

### Groupe 7 : toucher sous une cible

1. Dans le bloc « Cible fictive B », touche le tampon 3 : il est retenu là, pas sous A (VU). Touche-le de nouveau : relâché. Une troisième fois : retenu.
2. Choisis un niveau sous chaque cible, puis « Inscrire ».
3. Suivi › Profils › « Cibles ».

**Tu dois voir** : sous « Cible fictive A », l'inscription de cette production avec « Tampon fictif 1 (critère A1) » seul ; sous « Cible fictive B », avec « Tampon fictif 3 » seul ; sous « Sur ses productions », les deux.

### Groupe 8 : sans rien toucher

1. Évaluation › Annoter ; « Production fictive : deux cibles » ; le nom « Fictif-02, Personne-02 » (VU). Pose « Tampon fictif 2 » et « Tampon fictif 3 ».
2. « Inscrire pour une production » ; « Personne-02 Fictif-02 », « Production fictive : deux cibles ». Sans toucher aucun tampon, choisis « Aucun niveau » (VU) sous « Cible fictive A », puis « Inscrire ».
3. Choisis ensuite un niveau sous chaque cible, toujours sans toucher de tampon, puis « Inscrire ».

**Tu dois voir**, au geste 2 : aucun tampon retenu, sous aucune cible ; un refus en bas de la fenêtre, « « Cible fictive A » : choisis un niveau, renseigne un critère ou écris une rétroaction : une inscription vide ne s'inscrit pas. » (VU) ; la fenêtre reste ouverte. Au geste 3 : la fenêtre s'inscrit, et au profil de « Fictif-02 » aucune des deux inscriptions ne porte de tampon (lu dans la base par le banc, pas regardé à l'écran).

### Groupe 9 : la production sans cible déclarée

1. Évaluation › Annoter ; « Production fictive : aucune cible déclarée » ; « Fictif-02, Personne-02 ». Pose « Tampon fictif 1 (critère A1) » et « Tampon fictif 2 ».
2. Suivi › Profils ; choisis « Fictif-02, Personne-02 (2390002) » ; « Cibles ».
3. Évaluation › Tableau de notation › « Inscrire pour une production » ; « Personne-02 Fictif-02 », « Production fictive : aucune cible déclarée ».

**Tu dois voir**, au geste 2 : les deux tampons sous « Sur ses productions », et aucune trace « pas encore inscrite » sous une cible. Au geste 3 : les deux blocs (VU) ; sous A, « Tampon fictif 1 (critère A1) » déjà retenu (VU) ; sous B, rien.

### Ce que ce fichier ne fait pas essayer

- **Retirer un tampon de la production** (l'ancien geste 4) : le banc de l'étape 3 le joue ; le banc du fichier, non. Le geste reste à faire à la main si tu veux le voir.
- **Régler** (cocher « D'observation », donner un critère) : le fichier arrive déjà réglé. C'est l'étape 1.
- **Le toucher au doigt, le portrait, Safari** : rien de cela n'est joué ici.

## 10. Le fichier de départ d'essai (session du nuage, 25 nov., consigne de 9 h 45)

Aucun code de l'application n'a changé. Ni fusion, ni bump, ni ligne de Nouvelles, ni entrée de `RELAIS.md`.

### Ce qu'il porte, et comment il est fait

- **La classe** : montée par les gestes de « Mettre ta classe en place » (Automne 2026, 601-101-MQ, groupe 00001, quatre personnes « Fictif-01 Personne-01 » à « Fictif-04 Personne-04 »).
- **La pratique** « Par standards (fictive, essai) » : écrite dans l'ordre et la forme de `creerParStandards` (`js/vue-simple.js`) : l'échelle de départ, l'ensemble par `EnsemblesCibles.enregistrer`, la pratique, `PratiqueManager.changerPratiqueActive`. Deux cibles ; critères « Critère fictif A1 », « A2 », « B1 », « B2 ».
- **Les tampons** : dans la forme que l'éditeur de tampons enregistre (`enregistrerRetroObservations`), écrits dans les clés, **pas par les gestes de l'éditeur**. « Catégorie fictive (observation) », cochée, trois tampons, dont le premier déclare « Critère fictif A1 » ; « Catégorie fictive (autre) », non cochée, un tampon.
- **Les trois productions** : par `construireProductionData`, puis `ciblesRenseignees` (une cible, deux, liste vide).
- **Six images** : dessinées par la fabrique (leur texte dit « IMAGE FICTIVE (essai) », la production et la personne), importées par le vrai chemin d'import, pour les deux premières personnes.
- **Aucun tampon posé, aucune inscription** (témoins lus dans le zip).
- Deux avis fermés par leur geste à la fabrique, pour qu'ils ne couvrent pas l'essai : le rappel de mise à jour du codex (comme les autres fichiers de départ) et le jalon « Ton espace de travail est prêt » (`js/transitions.js`).
- Le codex s'appelle « ESSAI, tampons d'observation (fictif) » ; 239 Ko.

### Les mesures demandées

**a) La bande « Mode démonstration ».** Cause : la démo était active dans l'aperçu au moment d'ouvrir le fichier, et ouvrir un codex ne la quitte pas. Mesuré (Chromium) : espace vide, « Explorer la démo », puis le fichier des codes en lettres : `demo-actif` reste à `'true'`, la bande reste, alors que le groupe affiché est celui du fichier. Aucun des deux fichiers d'essai ne porte cette clé (lu dans leur zip). Dans un espace vide, le fichier s'ouvre **sans** la bande : le banc l'exige. **Ce que la bande change pour l'essai** : rien de mesuré sur le tableau des cibles ni sur la liste d'Annoter (les deux paraissent sous la bande). Deux réserves : je n'ai pas joué tout le parcours sous la bande, et « Quitter la démo » retire la bande et garde les données, mais laisse l'application sans groupe choisi (il faut le rechoisir dans le menu sous les onglets). C'est une inférence que cela vient du retour à l'état d'avant la démo ; je n'ai pas lu ce code.

**b) Ouvrir le fichier dans un espace qui porte déjà des données.** Mesuré : le fichier des codes en lettres ouvert, puis celui-ci par-dessus.
- Une fenêtre s'interpose avant le rechargement : « Modèle antérieur détecté », avec « Annuler » et « Remplacer » (VU). Elle paraît parce que les deux fichiers ont le même trimestre et des cours d'identités différentes. Elle n'annonce rien de grave ici ; il faut toucher « Remplacer ».
- Ensuite : **un remplacement clé par clé, pas un espace neuf**. Ce que le fichier porte remplace ce qui était là (groupe, productions, images, tampons, pratique). Ce qu'il ne porte pas **reste** : mesuré, l'évaluation du fichier des codes en lettres (une, orpheline) et son image (sept images en base au lieu de six). La démo, si elle était active, reste active.
- Ce que tu as importé à la main ce matin, je ne l'ai pas : je ne peux pas dire ce qui en resterait, seulement que la règle est celle-là.
- **Le geste sûr : CORRIGÉ le 25 nov., midi.** J'avais écrit ici : un onglet de navigation privée. **C'est faux sur l'iPad** : Grégoire l'a essayé, et à 10 h 59 l'écran d'Annoter affichait « Fichier manquant — rouvre le codex après avoir libéré de l'espace » ; le même fichier dans un onglet ordinaire montre l'image (#1311). Mon erreur : j'avais vérifié un contexte de navigateur neuf sous Chromium et tenu la navigation privée de Safari pour équivalente, en écrivant moi-même que je ne l'avais pas vue. **Le chemin qui a marché sur l'iPad** : un onglet ordinaire ; « Quitter la démo » si la bande verte est là ; « Ouvrir un codex… » ; « Remplacer » ; « Recharger ». Ce chemin laisse dans l'espace les clés que le fichier ne porte pas (ci-dessus, #1313) : sans effet mesuré sur le parcours de l'essai. Lu dans `netlify.toml` : les aperçus ne passent par aucune porte d'accès.

**c) Le chemin sur l'iPad** : le groupe 1 du § 9. Seuls les gestes dans l'application sont vus ; ceux de Safari (téléchargement, sélecteur de fichiers) sont décrits.

### La preuve

| Suite | Moteur | Résultat |
|---|---|---|
| La fabrique (témoins lus dans le zip : chaque pièce de la consigne) | Chromium | 1 sur 1 |
| `essai-tampons-observation-depart.spec.js` : la preuve de la consigne, puis le parcours du § 9 | Chromium | **2 sur 2**, cinq passages de suite |
| Banc de l'étape 3, rejoué | Chromium | **18 sur 18** |
| Vitest complet | | **12 433 sur 12 433 (961 fichiers)** |

**Vérifié en ligne** (25 nov., après le push, commit `e8a107f`) : `https://deploy-preview-62--codexnumeris-051225.netlify.app/departs/ESSAI-tampons-observation-lot-3.zip` rend 200, `application/zip`, 238 620 octets, la même empreinte que le fichier commis ; `/departs.html` rend 200 et porte la section d'essai et son lien. Ce fichier téléchargé, ouvert dans l'application EN LIGNE (Chromium, contexte neuf) : codex ouvert, groupe affiché, aucune bande de démo, six lignes dans Évaluation › Annoter. Pour le faire, l'hôte de l'aperçu n° 62 a été ajouté aux hôtes permis de l'environnement « labo-codex » des sessions du nuage (approuvé à l'écran) ; il peut en être retiré.

**Chromium suffit ici**, et c'est tout ce que cette session a : le banc éprouve que le fichier porte ses pièces et que l'essai se joue à partir de lui. Le comportement de l'étape 3 sous WebKit a son propre banc (§ 5). Rien n'a tourné sous WebKit dans cette session.

**Break-tests du banc** (25 nov., Chromium ; un fichier privé d'une pièce, lu par `DEPARTS_DOSSIER`) :

| N° | Le fichier privé de… | Rouge |
|---|---|---|
| E1 | la coche « D'observation » de la catégorie | les 2 essais (« Sur ses productions » absent) |
| E2 | la pratique du groupe (groupe non par cibles) | les 2 (pas de tableau des cibles) |
| E3 | une de ses six images | les 2 (image absente de l'espace ; page blanche en Annoter). **Passait vert au premier jet** : le banc ne regardait que la taille du canevas. Durci : l'image doit être dans l'espace et son encre à l'écran |
| E4 | la seconde cible de la production « deux cibles » | les 2 (case décochée ; un seul bloc) |
| E5 | le critère du tampon 1 | le parcours (le tampon n'est plus retenu sous A) ; la preuve reste verte, elle ne lit pas le critère |
| E6 | (ajout) la clé de la démo posée dans le fichier | les 2 (bande affichée) |

Six sur six après durcissement.

**Un rouge de mon fait, fini** : une pause fixe dans le banc faisait rougir la sentinelle des pauses (618 pour un plafond de 617). Remplacée par une condition.

### Pièces d'essai : à retirer avant la fusion

- `departs/ESSAI-tampons-observation-lot-3.zip`
- la section `data-essai="tampons-observation"` de `departs.html`
- `tests/departs-de-parcours/essai-tampons-observation.js`
- `tests/departs-de-parcours/essai-tampons-observation.spec.js`
- `tests/integration/essai-tampons-observation-depart.spec.js`

Chacune le dit dans son en-tête. Le § 9 de ce rapport cite le fichier : à réécrire ou à dater au retrait.

### Ce que j'ai tranché au-delà de la consigne

| N° | Décision | Ce que j'ai supposé |
|---|---|---|
| F1 | Les tampons sont écrits dans leurs clés, pas par les gestes de l'éditeur | Que la forme lue dans `enregistrerRetroObservations` suffit ; la palette, le profil et la fenêtre les lisent (VU) |
| F2 | Les images sont dessinées par la fabrique, pas tirées des fixtures | Qu'une image qui dit ce qu'elle est aide l'essai ; le fichier reste léger |
| F3 | Le jalon « Ton espace de travail est prêt » est fermé à la fabrique | Qu'il gênerait : il reste à l'écran d'un onglet à l'autre tant qu'on ne le ferme pas |
| F4 | La production sans cible porte une liste vide, pas un champ absent | C'est ce que la fiche écrit quand son bloc est affiché et que rien n'est coché |
| F5 | Un second essai au banc, le parcours du § 9 en entier | Que des gestes marqués (VU) doivent avoir été joués |
| F6 | Le retrait d'un tampon (ancien geste 4) n'est pas dans le parcours du banc | Hors de l'ordre demandé ; dit au § 9 |

### Trouvailles (trois issues)

| Trouvaille | Issue |
|---|---|
| Ouvrir un codex sur une démo active laisse la bande et l'état de démo | **Inscrit : #1312** (25 nov., midi, sur consigne de Cowork) |
| Ouvrir un codex par-dessus un autre laisse les clés que le nouveau ne porte pas (une évaluation orpheline mesurée) | **Inscrit : #1313** (25 nov., midi, sur consigne de Cowork) |
| La liste d'Évaluation › Liste dépasse l'écran à 1180 de large (la colonne des actions est hors champ) | **Commenter et oublier** : l'écran le dit lui-même ; le parcours passe par Évaluation › Annoter |

### L'arbre du Mac

`../labo-codex-tampons-production` est en retard de trois commits sur `origin/lot/tampons-observation-3-production` après ce push : `git pull --ff-only` avant d'y retravailler.

## 11. La retouche du 25 nov., midi : deux textes, après l'essai de Grégoire sur l'iPad

> Session du nuage. Consigne : Cowork, 25 nov., midi. Grégoire a essayé l'étape 3 sur l'iPad (Safari, aperçu n° 62, le fichier d'essai), de 11 h 10 à 11 h 47 : groupes 1 à 7 du § 9 conformes (rapporté par Cowork ; je ne l'ai pas vu). Il garde la carte « Sur ses productions » en bas et la marque « pas encore inscrite ».

### Ce qui change

- **I2.** L'étiquette « Tampons d'observation posés sur cette production » reste seule sur sa ligne. Les noms retenus ont leur ligne, entre les tampons et la phrase d'aide : « Retenus pour cette cible : Tampon A, Tampon B », ou « Retenus pour cette cible : aucun ». Dans un bloc comme dans plusieurs. La place demandée se lit bien aux deux formats (captures) : je n'en ai pas choisi d'autre.
- **I4.** Dans une fenêtre à plusieurs cibles, le bloc où au moins un tampon est retenu d'office par son critère ajoute : « Un tampon qui porte un critère de cette cible est déjà retenu. » La phrase est écrite à l'ouverture du bloc ; un toucher ne refait que la ligne des noms, elle reste donc si le tampon est relâché. **Cela ne coûte rien au code** (aucun état à garder). Elle est refaite, selon la même règle, quand l'étudiant·e ou la production change.
- « Observer » (lot 2) n'est pas touché : sa ligne de noms garde sa forme (`.oc-tampons-retenus`) ; son banc est rejoué.

Fichiers : `js/tableau-cibles.js` (`MOTS`, `_tamponsDuBlocHTML`, `_basculerTamponProduction`), `css/tableau-cibles.css` (`.tc-pr-retenus`), `index.html` (jetons anti-cache des deux fichiers), les deux bancs, la page de textes.

### La preuve

| Quoi | Où | Résultat |
|---|---|---|
| Banc du lot 3 (18 essais), banc du fichier d'essai (2), banc du lot 2 (17) | Chromium du conteneur (`playwright.chromium.config.js`) | **37 sur 37, deux passages de suite** (74 sur 74) |
| Vitest complet | conteneur | **12 433 sur 12 433** (961 fichiers), rejoué vert par le crochet pré-push |
| WebKit | | **RIEN N'A TOURNÉ** : le conteneur n'a pas WebKit (`/opt/pw-browsers/webkit-2287` absent ; les 35 essais lancés ont tous échoué au lancement du navigateur, aucun n'a jugé). Ni Safari, ni iPad. |

Ce que les bancs lisent à l'écran : la ligne « Retenus pour cette cible » dans une fenêtre à un bloc et à deux blocs, avec des noms et avec « aucun » ; l'étiquette seule sur sa ligne ; l'ordre étiquette, tampons, noms, aide ; la seconde phrase présente sous la cible A (tampon à critère), absente sous B, absente quand aucun tampon ne porte de critère, absente dans la fenêtre à un bloc ; présente encore après le relâchement du tampon.

**Mutations (Chromium, les deux bancs, 20 essais ; rejouées sur l'état final)** :

| Mutation | Rouges |
|---|---|
| I2 : le texte d'avant (« : aucun », sans « Retenus pour cette cible ») | 5 |
| I2 : la ligne des noms remonte à côté de l'étiquette | 3 |
| I4 : la seconde phrase dans tous les blocs d'une fenêtre à plusieurs cibles | 4 |
| I4 : la seconde phrase aussi dans la fenêtre à un bloc | 3 |

**Captures** (Chromium, clair, 1180 × 820 et 820 × 1180) : `inscrire-deux-cibles-retenu-par-son-critere-*.png`, remplacées. **Les autres captures de la fenêtre** (`inscrire-pour-une-production-*`, `inscrire-un-tampon-retire-*`, `inscrire-deux-cibles-rien-de-retenu-*`) montrent encore la ligne des noms à son ancienne place : je ne les ai pas reprises.

**Vérifié en ligne** (25 nov., après le push de `d19d36d`) : sur l'aperçu n° 62, `index.html` appelle `tableau-cibles.js?v=20261123i` et `tableau-cibles.css?v=20261123g` ; le script servi a la même empreinte que le fichier commis et porte les deux textes ; la feuille servie porte `.tc-pr-retenus` ; le fichier d'essai rend toujours 200. Lu par requête, pas dans un navigateur sur l'aperçu.

### Deux ratés de mon premier jet, corrigés avant la fin

1. J'avais donné à la seconde phrase une classe sans règle CSS (`tc-pr-aide-critere`) : le cliquet #679 l'a vue (Vitest, 1 rouge sur 12 433). Le repère est maintenant un attribut, `data-tc-aide-critere`. Le premier commit poussé de la retouche (`917a2c8`) porte ce défaut ; le suivant le retire.
2. L'essai « deux cibles, un tampon qui déclare un critère… » est devenu instable (1 échec sur 3) : son `check({ force: true })` sur le bouton radio caché « Aucun niveau » du bloc B ratait par moments, le bloc étant plus bas depuis la ligne ajoutée. Cause présumée, non mesurée : le défilement de la fenêtre. L'essai touche maintenant la tuile, comme un doigt : 12 passages sur 12, puis les deux passages complets. **Je n'ai pas établi que ce raté est sans équivalent pour un doigt** : c'est une inférence (un doigt touche la tuile visible, pas un bouton caché).

### Ce que j'ai tranché au-delà de la consigne

- La ligne des noms passe à la ligne si elle est longue, au lieu d'être coupée par « … » comme sur « Observer ».
- La seconde phrase suit la première dans le même paragraphe d'aide ; la ligne des noms est rattachée aux tampons pour un lecteur d'écran (`aria-describedby`).
- Les jetons anti-cache de `tableau-cibles.js` et `tableau-cibles.css` avancent dans `index.html` : le crochet de commit l'exige. Ce n'est pas un bump : `version.json` n'est pas touché.
- Le banc du lot 3 prend les deux captures quand `LOT3_CAPTURES` nomme un dossier ; sans cela, il n'en prend aucune.
- #1311 à #1314 sont placés en tête de « A faire ».
- #1314 : la consigne ne dit pas qui a vu la fenêtre sur l'iPad ; j'ai écrit « rapporté par Cowork », sans l'attribuer à Grégoire.

### Trouvailles (trois issues)

Les quatre de la consigne : **inscrites**, #1311 à #1314, aucune corrigée. Rien d'autre trouvé en chemin, hors mes deux ratés ci-dessus, qui étaient mon lot.

## Journal des break-tests (25 nov. 2026 ; V : Vitest, P : WebKit)

| N° | Mutation | Rouge |
|---|---|---|
| B1 | poser un tampon écrit dans `inscriptionsCibles` | V : F ; P : « un tampon posé pour de vrai… » |
| B2 | un tampon non reconnu est lu quand même | V : B ; P : « …catégorie non cochée… », « le nom est lu au présent… », « …sans catégorie d'observation… » |
| B3 | « une seule cible » accepte plusieurs cibles | V : C, D ; P : « …à deux cibles, ou sans cible… » |
| B4 | la lecture en direct s'ajoute à l'inscription | V : D ; P : « les tampons de la production se voient avant… », « une inscription annulée… » |
| B5 | un tampon relâché reste retenu | P : « …se voient avant… », « deux cibles… » |
| B6 | la date est celle de la lecture, pas de la pose | V : A, B, D (7) ; P : 3 essais |
| B7 | la carte « Sur ses productions » ne se dessine pas | P : 9 essais |
| B8 | rien n'est lu en direct sous la cible | P : 4 essais |
| B9 | les noms des tampons retenus ne sont plus échappés dans la fenêtre | P : « …sont du texte… » |
| B10 | une inscription annulée éteint la lecture en direct | V : D ; P : « une inscription annulée… » |
| B11 | un tampon est d'observation sans que sa catégorie soit cochée | P : « …catégorie non cochée… », « …sans catégorie d'observation… » |
| B12 | un tampon supprimé reste lu | P : « le nom est lu au présent… » |
| B13 | changer d'étudiant·e ne relit pas les tampons | P : « changer d'étudiant·e… » |
| B14 | seule la première page est lue | V : B (2) ; P : « plusieurs pages… » |
| B15 | la section « Cibles » se montre hors pratique par cibles | P : « hors pratique par cibles… » |
| B16 | la rétroaction écarte un tampon d'observation | P : « la rétroaction de l'étudiant·e… » |
| B17 | l'inscription ne reçoit aucun tampon | P : « …se voient avant… », « deux cibles… » |
| B18 | une trace lue en direct porte un bouton d'annulation | P : « une production à une seule cible… » |
| B19 | la marque « pas encore inscrite » n'est pas écrite | P : « une production à une seule cible… » |
| B20 | les productions de tout le groupe sont lues pour un·e étudiant·e | V : B ; P : « plusieurs pages… », « changer d'étudiant·e… », et un troisième |
