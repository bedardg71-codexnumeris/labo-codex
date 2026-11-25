# Rapport : « Tampons d'observation », lot 3 — sur une production (25 novembre 2026)

> Claude Code, sur le Mac, branche `lot/tampons-observation-3-production`, partie de `lot/tampons-observation-2-observer`
> (`c7db591a8`), arbre `../labo-codex-tampons-production`. Consigne : Cowork, « Gestion des pratiques de notation 5 »,
> 25 nov., 5 h 50 ; décisions de Grégoire du 25 nov. (5 h 39, 5 h 40). **Rien n'est en ligne** : aucun bump, aucune ligne de
> Nouvelles, rien dans `main`. **Aperçu** : https://deploy-preview-62--codexnumeris-051225.netlify.app (demande n° 62, en
> brouillon, « APERÇU, ne pas fusionner » ; elle porte les lots 1, 2 et 3).

**Fait.** Un tampon d'observation posé sur une production se lit aussitôt au profil, section « Cibles » : sous sa production, à la date de la pose, et sous la cible quand la production n'en vise qu'une. « Inscrire pour une production » montre ces tampons dans le bloc de chaque cible, avant le niveau ; on en retire en les touchant ; ceux qui restent sont copiés dans l'inscription. Poser un tampon n'écrit aucune inscription. Vert sous WebKit et Chromium (14 essais sur 14 chacun), Vitest complet vert (12 425), 20 break-tests rouges sur 20.
**Ce qui contredit la consigne** : rien dans les mesures a) à d). Trois points que la consigne ne tranche pas et que j'ai tranchés (§ 3) : 1. avec plusieurs cibles, chaque bloc reçoit d'office tous les tampons ; 2. un tampon posé APRÈS l'inscription ne rejoint plus la cible (seulement la production) ; 3. « aussitôt » veut dire au plus 2 secondes (le délai d'enregistrement d'Annoter, non touché).
**Ce qui reste** : l'essai de Grégoire sur l'iPad (§ 9), la page de textes (`TEXTES-2026-11-25-tampons-observation-lot-3.md`, quatre questions), la place du rang « Sur ses productions », proposée sur capture (§ 4). Pas de verdict WebKit complet : rien ne part en ligne.

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
| 1 | **Plusieurs cibles dans « Inscrire pour une production »** : chaque bloc de cible montre tous les tampons de la production, retenus d'office ; on retire dans un bloc sans toucher l'autre | Que « sous la cible choisie » vaut pour chaque cible qui reçoit quelque chose. Conséquence : sans retrait, le même tampon est copié sous deux cibles. **À confirmer par Grégoire** |
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

## 9. Les gestes d'essai pour Grégoire

La démo « Par standards » n'a aucune production importée (rapport de mesure, point 8) : l'essai se fait sur l'aperçu, **dans un groupe d'essai dont la pratique est par cibles**, avec au moins une production qui déclare une seule cible et une autre qui en déclare deux ou aucune. Les libellés marqués (VU) sont ceux que j'ai vus à l'écran ; les autres sont décrits, pas cités.

1. **Régler.** Évaluation › Tableau de notation › « Observer » (VU) › choisir une cible › « Régler mes tampons » (VU) › cocher « D'observation » (VU) pour une catégorie › « Enregistrer ».
2. **Poser.** Importer une production pour un·e étudiant·e (une photo ou un PDF), l'ouvrir en Annoter, poser un tampon de cette catégorie et un tampon d'une autre catégorie.
3. **Relire.** Suivi › le profil de l'étudiant·e › section « Cibles » (VU). Attendu : la carte « Sur ses productions » montre le premier tampon à la date d'aujourd'hui, pas le second ; si la production vise une seule cible, il paraît aussi sous cette cible avec « pas encore inscrite ».
4. **Retirer.** Revenir en Annoter, retirer le tampon de la production, revenir au profil : il n'y est plus.
5. **Inscrire.** Le reposer, puis Évaluation › Tableau de notation (vue étendue) › « Inscrire pour une production » (VU) › choisir l'étudiant·e et la production. Attendu : le tampon paraît dans le bloc de la cible, au-dessus des niveaux. Le toucher le retire de l'inscription ; le toucher de nouveau le remet. Choisir un niveau › « Inscrire » (VU).
6. **Relire encore.** Au profil : sous la cible, une seule entrée pour cette production, avec le niveau et le tampon, sans « pas encore inscrite » ; sous « Sur ses productions », le tampon est toujours là.
7. **Sur l'iPad** : le toucher des tampons dans la fenêtre, en portrait et en paysage.

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
