# Les cadrages ouverts — ce qui est pensé mais pas commencé

> **Écrit le 3 septembre 2026 au soir, par Cowork, à la demande de Grégoire.**
> **Motif, dans ses mots** : *« Les documents devraient être référencés dans un document de
> cadrage afin qu'on ne les perde pas de vue. »*
> Application au moment de l'écriture : **1.113.0** en ligne, build `0903-0906`.
>
> ⛔ **CE FICHIER NE PORTE AUCUN CONTENU PROPRE.** C'est une porte d'entrée. Chaque cadrage
> reste la source, et un cadrage ne se résume pas ici — il se lit.
> ⚠ **`plans de travail/` contient plus de cent trente fichiers**, dont l'écrasante majorité
> est exécutée depuis des semaines. **Sans cette page, un cadrage vivant s'y noie.**
>
> ⮕ **Tenu par Cowork.** Un cadrage qui devient une consigne quitte cette liste ; un cadrage
> neuf y entre le jour où il est écrit.

---

## ▣ CE QUI EST OUVERT AUJOURD'HUI — huit cadrages ; livrés : le 3 (1.116), le 7 (1.117), le 1 étapes 2 et 3 (1.118, 1.119), le 2 (1.119), le 5 (1.119), le 8 (1.120) ; le 1 est CLOS (étape 4 abandonnée) ; ouverts : le 4, le 6 (à trier)

*Aucun n'empêche un des huit énoncés de la cohorte 1 : ils sont tous parcourus depuis le
3 septembre au matin. Ces quatre-là traitent l'**adoption** et la **justesse**, pas la ligne
d'arrivée qui vient d'être franchie.*

### 1 · Le texte troué — `CADRAGE-2026-09-02-badges-texte-troue.md`
↻ **5 septembre 2026, 11 h 16 (Cowork)** : **étapes 1, 2 et 3 LIVRÉES** (1.115 → 1.119 ; l'étape 3 = `composeur-badges.js`,
porte iPad 4/4). **Étape 4 ABANDONNÉE (11 h 35, décision de Grégoire, après `INVENTAIRE-2026-09-05-badges-inventes.md`)** : pas de badge inventé pour
les critères algorithmiques ; « palette fixe » tient. **Le cadrage est CLOS.** Prochain accent, non daté : la synthèse des
rétroactions dans le PDF ; et ce que les utilisateurs demanderont à l'usage.
↻ **4 septembre 2026, vers 13 h 45 — PROCHAINE SÉANCE après 1.117, décidé par Grégoire** (« oui » à la
recommandation de Cowork) : **l'étape 2, les paliers de projection** — la phrase « Ce que l'élève lit » d'un
palier se compose avec les badges (l'artefact « Le texte troué », sections 2 et 3, est la maquette qu'il a
remontrée). Motif : chantier entamé, six arrêtés déjà pris, même écran que le volet C du lot 4, et c'est le
piège `[service]`/`{service}` qu'il a rencontré lui-même. ⛔ Pas dans 1.117 (une livraison par séance).
Cowork cadre à froid : mesurer d'abord quels repères le bloc de projection connaît réellement (la maquette
en montre sept, le bloc des énoncés n'en a que quatre).
**Composer la phrase que l'élève lira en posant ses variables d'un clic**, au lieu de taper des
accolades. Modèle de Grégoire : la cellule de formule dans Numbers.
▣ **SEUL CHANTIER ENTAMÉ** : l'étape 1 (les quatre énoncés de rétroaction) est livrée et vue à
l'écran. ⏳ Restent les paliers de projection, puis les accolades qui disparaissent, puis les
badges que l'enseignant invente.
⚠ **La palette n'est pas celle du cadrage** : le bloc des énoncés connaît **quatre** repères
(`{critere}`, `{erreurs}`, `{mots}`, `{points}`), pas dix. Mesuré le 3 septembre.

### 2 · Les codes par grille — `CADRAGE-2026-09-03-codes-par-grille.md`
↻ **5 septembre 2026, 11 h 16 (Cowork) : EXÉCUTÉ** — lot A livré dans 1.119 (`a3deac63`) : une seule liste, la case en tête,
couleur et pli « Observation » quand elle est cochée, la carte « Codes d'annotation » disparue.
↻ **4 septembre 2026, 19 h (mesuré par Cowork) : LE MÉCANISME EST LIVRÉ DEPUIS LE 3** (`js/codes-annotation.js`,
commits `2084c20f` → `61982b1f` ; `CODES_ERREURS_FR` n'est plus lu qu'en repli). **Ce qui reste = le lot A du
5 septembre** (`CONSIGNE-2026-09-05.md`) : fusion des deux listes du gabarit (point 7), la ligne « où vit la
palette » (point 6), le mot « Observation » (point 8).
**Les dix codes d'erreurs de français cessent d'être écrits dans le code.** La grille porte sa
liste ; sans liste, on retombe sur les dix — donc **rien à réparer dans les données**.
⛔ **LIRE SA SECTION « NOMENCLATURE » EN PREMIER** : un **code** identifie et compte, un
**tampon** commente et se restitue. Ce cadrage s'appelait « tampons » et c'était faux.
↻ **Tranché** : les codes SONT les sous-critères · les tampons restent **restitués**, pas
interprétés (phase 1).

### 3 · La grille analytique — `CADRAGE-2026-09-03-grille-analytique.md`
**Le menu offre un choix qui n'en est pas un** : `grep` rend **0** test de comportement sur
« holistique » comme sur « analytique », contre **17** sur « algorithmique ».
↻ **Décision** : l'analytique reçoit le comportement promis — des **points** et des **éléments
observables par critère**, là où l'holistique n'a qu'une échelle globale.
▣ **Spécification** : la grille papier de Grégoire, « Évaluation de l'analyse 3 » (2013).
⏳ **Six points ouverts**, dont le mariage avec les pratiques de notation — **laissé ouvert
volontairement** : il se tranchera par un essai sur ses données.
↻ **4 septembre 2026 : les trois lots sont livrés** (lot 1 en 1.115, lots 2 et 3 en **1.116**,
avec trois retouches issues du coup d'œil de Grégoire). Ce cadrage devient une consigne exécutée ;
**ce qu'il a ouvert en retour vit au cadrage 7 (lot 4)**.

### 4 · L'Inspecteur de sélection — `CADRAGE-2026-09-03-inspecteur-selection-multiple.md`
**Sélectionner plusieurs blocs, et l'Inspecteur n'offre que ce qu'ils ont en commun.**
⛔ **Le piège est nommé dedans** : un champ qui écrit une valeur commune sur toute la sélection
détruit en silence ce qui différait. ⮕ Une voie moins coûteuse y est proposée — n'ouvrir la
sélection multiple qu'aux **gestes**, pas aux **propriétés**.

### 5 · Les collections de paramètres — `CADRAGE-2026-09-03-collections-de-parametres.md`
↻ **5 septembre 2026, 11 h 16 (Cowork) : EXÉCUTÉ** — lot B livré dans 1.119 (`b6bf80b9` → `9ec87e70`, carte
`CARTE-2026-09-05-collections.md`). Reste hors périmètre, inscrit là : la modale de bibliothèque et « importer depuis un autre
trimestre », qui viennent avec le partage.
**Enregistrer un jeu de paliers sous un nom (« EUF ») et le retrouver dans une grille neuve**, au
lieu de repartir des défauts à chaque critère algorithmique.
⛔ **LA DEMANDE VISAIT LE MAUVAIS MENU** : l'EUF n'est pas une **formule** (combien l'élève perd),
c'est une **projection** (où il se situe) — et ce choix existe déjà, sous le nom « Norme externe
(épreuve uniforme) ». Les fondre referait le défaut que septembre vient de défaire.
▣ **Ce qui manque est ailleurs** : le registre des modèles est une liste fermée dans le code.
L'enseignant règle, mais **n'enregistre pas sous un nom**.
↻ **Le mécanisme d'accueil existe** : la bibliothèque range déjà quatre familles d'objets nommés
(grilles, échelles, pratiques, productions). Une échelle **est** déjà une collection de paramètres.
↻ **Tranché par Grégoire le 4 septembre 2026 : la COPIE.** Une collection corrigée ne change pas
ce qu'un élève a déjà lu. Plus rien n'attend sa décision sur ce cadrage.

### 6 · Replier le gabarit algorithmique — `CADRAGE-2026-09-03-accordeons-gabarit-algorithmique.md`
**Le gabarit du critère algorithmique est trop long** ; ses sections se replient en bandes bleues,
comme dans Cadre et dans l'aide. ▣ **Le composant existe** — une bascule unique
(`pratiques.js:2113`) et une délégation qui a déjà remplacé 78 gestionnaires écrits à la main.
↻ **Tranché par Grégoire** : **ouvert ce qui porte la note** (modèle de formule, paramètres,
sous-critères) · **fermé ce qui porte les mots** (énoncés, paliers de projection, codes).
⚠ **Le piège est nommé, et il ne se voit qu'en tapant** : le gabarit se redessine en entier à
chaque frappe (`grilles.js:5025`, `5039`, `5051`). Un pli qui vit dans le DOM se refermerait sous
les doigts. ⮕ **L'état vit en mémoire, jamais dans les données de la grille.**
↻ **4 septembre 2026** : Grégoire a ajouté **l'ordre** (les sous-critères en premier), l'espace
manquant entre formule et projection (réglé par les cartes), et deux libellés. **Absorbé par le
cadrage 7 (lot 4)**, dont ce fichier reste la source pour les cartes.

### 7 · Le lot 4 — `CADRAGE-2026-09-04-lot-4-gabarit-algorithmique-et-paliers-analytiques.md`
**Ce que le coup d'œil de Grégoire sur les lots 2 et 3 a ouvert, rangé pour la prochaine séance** :
(A) une grille analytique attache sa cartouche à des **paliers en %**, sans qu'on lui parle de
« niveaux » — l'échelle reste le mécanisme, préremplie, renommée (voie (a), **tranchée**) ;
(B) « **Aucun** » au menu « Niveau SOLO » ; (C) le gabarit algorithmique se range — sous-critères
en tête, cartes repliables, « Modèle de commentaire », « Projection à l'EUF », et le **défaut de
projection à trancher** (recommandation : « Aucune projection ») ; (D) l'espace à droite du chiffre
sur le PDF, à rejuger avec une vraie cartouche.
⛔ **Pas une consigne** : à cartographier d'abord (règle 2), et la relecture croisée est due sur (A),
qui touche un format qui voyage.

---

### 8 · La carte « Bilan » — `CADRAGE-2026-09-05-carte-bilan.md`
↻ **5 septembre 2026, 8 h 01 (Cowork), décision de Grégoire** : « Observation » devient « Bilan » et ne garde que les deux
phrases du bilan ; « Aucune annotation » va dans « Codes d'annotation » ; le menu du modèle se renomme ; la
description « #581 » lue par les collègues disparaît. **Pas dans 1.119 sauf décision contraire.** Rendu seul.
↻ **5 septembre 2026, 13 h 53 (Cowork) — LIVRÉ dans 1.120.0** (`1b06b1ba`, release `c4c7b04a`, build `0905-1315`), cinq points sur cinq,
avec la correction du point 3 (« Aucune annotation » sous la case des codes, pli « Quand la copie ne porte aucun code », la carte
« Codes d'annotation » n'existant plus) et le point 5 (« Français écrit », mots de Grégoire à 11 h 41). Vérifié : relecture de Cowork
sur le commit, coup d'œil de Grégoire, changelog validé par lui. Plus rien d'ouvert ici.

## 🔎 LA SÉRIE D'AUDITS CADRÉS — trois audits, un ordre, une règle de fermeture

*Ouverte le 5 septembre 2026 par Cowork, à la demande de Grégoire : « le moteur d'évaluation, et ce
qui a été couvert comme inspection ». Les prompts vivent dans `Rapports/prompts-audit/`, les
rapports dans `Rapports/`. **Un audit n'est fermé que quand chaque constat porte sa disposition dans
son fichier** (`CLAUDE.md`, « Ce qu'un audit doit produire ») — et les dispositions sont
PROPOSÉES par l'auditeur, ARBITRÉES par Grégoire, avant tout lot de correction.*

| n° | objet | prompt | état au 5 septembre, 16 h 30 |
|---|---|---|---|
| 1 | **Le moteur d'évaluation** — la note d'une copie (calcul, formules, projection, énoncés, rétroaction ; frontière avec `pratiques/`) | `PROMPT-AUDIT-moteur-evaluation-2026-09-05.md` | ▣ **EXÉCUTÉ et FERMÉ le jour même** : `Rapports/AUDIT-moteur-evaluation-2026-09-05.md`, 8 flux, banc de 30 mesures. Trois « corriger maintenant » arbitrés par Grégoire et **livrés en 1.121.0** (#697 échelle introuvable, #698 effacement des codes, #699 auto-save et bilan), **éprouvés par lui à l'écran**. Inscrits pour après le 14 : #700 à #705 ; H-1 (frontière) → audit 2 (#706). Une réserve de Cowork sur G-2 (source unique prouvée sur une grille holistique seulement), à inscrire. |
| 2 | **La pratique de notation** — la note du cours (quatre familles SOM/STD/SPE/DEN, les deux systèmes de calcul, l'échelle globale, les jetons) | `PROMPT-AUDIT-pratique-de-notation-2026-09-05.md` | ⏳ **À EXÉCUTER** — prêt, relais donné à Grégoire le 5 septembre. Part du flux H de l'audit 1. Ferme au passage `ultrareview-lot-3-indices.md` et `ultrareview-lot-4a-evaluation.md` (mai, sans disposition). |
| 3 | **L'onglet Suivi** — présences → assiduité, complétion, niveau, IPB, palier RàI, interventions, agrégats du groupe, graphiques ; **et la protection du volet confidentiel** dans tout ce qui sort | `PROMPT-AUDIT-onglet-suivi-2026-09-05.md` | ⏳ **À EXÉCUTER EN TROISIÈME**, après le 2 (il lit ce que les deux moteurs produisent). Jamais audité comme onglet (mesuré le 5 septembre). Ferme au passage `ultrareview-lot-6-travaux-saisie.md` (N1-N6, présences) et les §5.3/§8/§9 de `AUDIT-decouplage-srpnf-idme-conception-2026-08-27.md`. |

### Né du second audit · Ce que vaut un non-remis, famille par famille — `CADRAGE-2026-09-05-non-remis-par-famille.md`
**Une règle par famille, pas une règle de moteur** (Grégoire, 5 septembre) : zéro en sommative, ignoré en
« meilleures notes » si le minimum est atteint. Première mesure due : ce que chaque famille fait aujourd'hui de
`statutRemise: 'non-remis'`. **Après le 14**, avec les constats moyens du second audit.

⮕ **Pourquoi trois audits courts plutôt qu'un grand** : le 1er septembre, sur 51 rapports, 22 étaient
sans suite. Un audit qui pose deux questions sur 13 000 lignes produit un rapport que personne ne
ferme. Chaque audit a **une** question directrice, un périmètre compté au `wc -l`, des élèves ou
des copies de banc avec le nombre attendu calculé à la main, et une section « ce que je n'ai pas
regardé » obligatoire — celle qui manquait le 25 août.
⮕ **Après le 3** : ce qui reste sans inspection cadrée, à ce jour, c'est l'onglet Conception
(audité le 25 août, `AUDIT-conception-gabarits-2026-08-25.md`, dispositions à vérifier), le
Calendrier, le Labo, l'Aide et les Réglages. Rien n'est cadré pour eux ; ce n'est pas un oubli,
c'est un choix : les trois audits couvrent ce qui écrit un chiffre sur le document d'un élève.

---

## ⏳ INSCRIT AILLEURS, ET QUI N'A PAS DE CADRAGE

- **Corbeille et chevrons partout, et les deux colonnes qui s'empilent sur iPad** — mesuré par Claude Code le
  4 septembre (lot 4, §7 c-d) : hors de l'éditeur de grille, le ✕ rouge vit encore dans la bibliothèque (1)
  et la pratique de notation v2 (3), la pile « Ordre » dans l'éditeur d'échelles (3 sites) ; et la grille à
  deux colonnes du formulaire groupe-cours (empruntée par les paliers) **n'a aucune règle d'empilement en
  portrait iPad**. Un cadrage design à froid (skill `design-interface`), trois gestes : un seul bouton de
  suppression, un seul geste d'ordre, une règle d'empilement pour les deux écrans.

- **Corriger une échelle, avec recalcul proposé** — décidé le 3 septembre, dans
  `plans de travail/DECISION-2026-09-03-echelle-remplacement.md`. **Jamais automatique** :
  *« il permet d'informer l'utilisateur des conséquences de son geste »*.
- **Dire qu'un document reçu est une copie** (#696), au partage ou à la réception — pas dans une
  fenêtre de suppression.
- **Un remplacement d'échelle interrompu** : l'ancienne survit et relancer termine le travail,
  **mais l'écran ne le dit pas**. Inscrit sous #648.
- **Les essais à la main sur iPad.** Le dernier point de « ce qui n'appartient qu'à Grégoire ».

- **Repasser le dépôt en public** — possibilité notée par Grégoire le 4 septembre 2026 (fin d'après-midi),
  **laissée de côté pour l'instant**. Ce que ça rendrait (docs GitHub, mesuré le 4) : minutes Actions
  illimitées sur les runners standards (au lieu de 2 000/mois, quota déjà épuisé en août), runner Linux
  4 vCPU / 16 Go au lieu de 2 / 8, shards sans facture, protection de branche et CodeQL de retour
  (`DEPLOY.md` §8.3). ⛔ **Le préalable** : le dépôt est privé depuis le 23 juin parce que l'historique git
  porte encore des noms et des DA d'élèves réels (`SESSION.md:9211`, « purgeable plus tard si le statut
  change ») — purge de l'historique (`git filter-repo`), audit adverse après purge, demande à GitHub
  d'effacer les commits en cache. Ses données réelles et son engagement public : la décision est à lui.
  Pas avant le 14 septembre.

---

## ⛔ CADRAGES ANCIENS — à trier, pas à exécuter

*Ils sont dans le même dossier et se confondent avec les vivants. **Aucun n'a été remesuré.**
⚠ Avant d'en ouvrir un : vérifier qu'il n'a pas été exécuté depuis.*

| fichier | date | état |
|---|---|---|
| `CADRAGE-2026-09-01-front-evaluations-et-code-en-dur.md` | 1er sept. | à remesurer |
| `CADRAGE-320-repertoires-bibliotheques.md` | — | à remesurer |
| `CADRAGE-327-classement-transversal-biblios.md` | — | à remesurer |
| `CADRAGE-briques-C-D-namespacing.md` | 26 juin | ▣ le namespacing a été livré depuis — **probablement périmé** |
| `CADRAGE-guides-pedagogiques-post-AQPC.md` | 2 juin | à remesurer |
| `CADRAGE-premier-essai-verification-adverse-338.md` | — | à remesurer |

---

## Comment cette page se tient

▣ **Un cadrage entre ici le jour où il est écrit**, avec une ligne : ce qu'il vise, et ce qui y
est tranché.
▣ **Il en sort quand il devient une consigne** — et la consigne, elle, vit dans
`plans de travail/CONSIGNE-DU-JOUR.md`, une seule à la fois.
⚠ **Ce fichier ne dit jamais l'état du code.** Pour ça : `OU-EN-EST-ON.md` et le dépôt. **Une
ligne d'ici qui contredit une mesure a tort.**
