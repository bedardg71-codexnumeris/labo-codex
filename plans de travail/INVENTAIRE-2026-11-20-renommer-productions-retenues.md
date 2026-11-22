# Inventaire — renommer la pratique « Standards » en « Par productions retenues »

> **Nom retenu (Grégoire, 20 nov. 2026, 20 h 02) : « Par sélection de productions ».** « Par productions retenues » est abandonné : lire ce nom partout ci-dessous comme l'ancienne proposition.
> **Portée réduite à vingt textes** (là où on choisit la pratique et là où on la nomme), acceptés mot pour mot à 20 h 44 et posés sur `lot/renommer-selection-productions` : `TEXTES-2026-11-20-selection-de-productions.md`, consigne `CONSIGNE-LOT-2026-11-20-renommer-selection-productions.md`.
> **Le reste de cet inventaire attend** : l'aide, le glossaire, les parcours, le badge et les réécritures du §4 ne sont pas appliqués.

> Lecture seule. Mesuré le 21 nov. 2026 sur `origin/main` à `e31a8556`. Aucun fichier de `js/`, d'`index.html` ni de `styles.css` n'a changé.
> Consigne : `CONSIGNE-2026-11-20-renommer-productions-retenues-inventaire.md`.
> **Tous les textes proposés ici attendent le oui de Grégoire** (correction du 20 nov., 19 h 08). Rien ne s'applique avant sa relecture.
> Aucune autre session ne travaillait sur la machine : pas d'arbre à part.

## 0. Ce qui a été mesuré, et comment le lire

| Mesure de Cowork | Mesuré | Remarque |
|---|---|---|
| « standards » dans 53 fichiers de `js/`, 285 lignes | **confirmé** (53, 285), en respectant la casse | sans la casse : 57 fichiers, 432 lignes |
| 12 lignes d'`index.html` | **confirmé** (12) en respectant la casse | sans la casse : 32, dont 16 sont des commentaires de balises `<script>` |
| « PAN-Standards » dans 19 fichiers | **20** (`js/` et `index.html`) | écart d'un fichier, sans conséquence |
| « Par standards », `js/vue-simple.js` l. 98 | **confirmé** | voir V3 : ce titre devient le NOM enregistré de la pratique |
| 191 fichiers de tests | **189** sans la casse | la plupart ne tiennent que l'identifiant `'standards'` ; voir §5 |

**Méthode.** `grep` sans la casse sur `js/` et `index.html`, commentaires écartés, puis lecture de chaque ligne restante pour séparer l'identifiant (`'standards'`, `pan-standards`, `STD` comme clé) du texte affiché. `js/changelog-data.js` est exclu : les Nouvelles publiées ne se retouchent pas.

**Limites, à dire.**
- Un texte est compté « affiché » quand la ligne construit du HTML, un libellé ou un message. Je n'ai pas ouvert l'application : pour trois lignes (F8, F9, F15), je n'ai pas trouvé le lecteur et l'affichage reste **non confirmé**.
- Les colonnes « proposé » sont **mes** propositions. Je ne suis pas placé pour juger de leur justesse didactique : c'est l'objet de la relecture.

## 1. Le constat qui pèse sur tout le reste

**« Les productions retenues » est déjà un nom commun de l'application**, dans les mêmes phrases que le nom de la pratique. Un remplacement mot pour mot produit des phrases qui tournent en rond :

- `js/pratiques/pratique-registre.js:933` deviendrait « En productions retenues, la note du cours s'appuie aussi sur les productions retenues » ;
- `index.html:10287` : « **PAN – Productions retenues.** […] les productions retenues font toute la note » ;
- `js/vue-simple.js:98`, le lien « Choisir les standards » deviendrait « Choisir les productions retenues », qui se lit comme le geste de cocher des productions.

Les propositions ci-dessous contournent ce piège ligne par ligne (lignes marquées ⟲). Le nom étant retenu « pour l'instant », ce constat vaut d'être connu avant la relecture ; je ne propose pas d'autre nom.

## 2. Les formes proposées (point 3 de la consigne)

| Forme | Aujourd'hui | Proposé | Où elle sert |
|---|---|---|---|
| Longue | « Par standards », « PAN par standards (STD) » | **« Par productions retenues »** | titre du modèle de la vue simple, glossaire, phrases de l'aide et des parcours |
| Longue avec famille | « PAN-Standards », « PAN – Standards » | **« PAN – Productions retenues »** | menu « Type » de la fiche, assistant, bibliothèque, infobulle du badge, colonne « Pratique (nom) » de l'export |
| Courte | « Standards », « en standards » | **« Productions retenues »** ; dans une phrase, « par productions retenues » | énumérations (« Productions retenues, Spécifications, Dénotation ou Sommative »), phrases courantes. « En productions retenues » se lit mal : je propose « par productions retenues » partout |
| Badge | « STD » | **« RET »** (ou « PPR », au choix de Grégoire) | les cinq endroits ci-dessous |

**Le badge peut-il changer sans toucher la clé ?** Aujourd'hui non : le texte du badge EST la clé. `REPRESENTATIONS_PRATIQUES.standards.code` (`pratique-registre.js:75`) vaut `'STD'`, sert de test (`obtenirCode() === 'STD'`, une quinzaine de lecteurs), de classe CSS (`badge-type-std`) et de valeur enregistrée (`pratiques: ['STD']` dans les pratiques des gens).

**Ce que ça coûterait.** Un champ d'affichage distinct (par exemple `badge: 'RET'`) à côté de `code`, lu par les cinq endroits qui impriment le code : `pratique-registre.js:138`, `pratiques-gestion.js:200`, `main.js:320`, `wizard-pratique-v2.js:1872`, `comparateur-pratiques.js:741`. La clé, la classe CSS et les données restent `STD`. Deux lignes de banc à mettre à jour (`representation-pratiques.test.js:72` et `81`). Estimation : une demi-heure, bancs compris.

**Hypothèse retenue, à corriger au besoin** : dans l'export CSV, la colonne « Pratique (code) » garde `STD`. C'est une clé qu'un tableur peut relire d'un trimestre à l'autre ; seule la colonne « Pratique (nom) » changerait.

## 3. Le tableau des textes affichés — 73 lignes sur main

« … » marque un texte abrégé : seul le segment montré change. ⟲ : formulation choisie pour éviter la répétition du §1. § 4 : phrase à réécrire, voir la section 4.

### Vue simple — 6

| N° | Fichier : ligne | Où on le lit | Aujourd'hui | Proposé |
|---|---|---|---|---|
| V1 | `js/vue-simple.js:44` | carte « Ta pratique » de l'accueil | « Choisis un modèle, par standards ou par spécifications, et la règle qui construit la note. » | « Choisis un modèle, par productions retenues ou par spécifications, et la règle qui construit la note. » |
| V2 | `js/vue-simple.js:91` | note sous le sélecteur de groupe | « … n'est ni par standards ni par spécifications se suit en vue étendue. » | « … n'est ni par productions retenues ni par spécifications se suit en vue étendue. » |
| V3 | `js/vue-simple.js:98` (`titre`) | titre du modèle ; **devient le nom de la pratique créée** (`vue-simple.js:1237`) | « Par standards » | « Par productions retenues » |
| V4 | `js/vue-simple.js:98` (`lien`) | bouton du modèle | « Choisir les standards » | ⟲ « Choisir ce modèle » |
| V5 | `js/vue-simple.js:159` | écran Pratique, autre famille | « … n'est ni par standards ni par spécifications : elle se règle en vue étendue. » | « … n'est ni par productions retenues ni par spécifications : elle se règle en vue étendue. » |
| V6 | `js/vue-simple.js:166` | tableau, autre famille | « Le tableau sert aux pratiques par standards et par spécifications. … » | « Le tableau sert aux pratiques par productions retenues et par spécifications. … » |

⚠ **V3 : source ou stock ?** Le titre du modèle est écrit comme `nom` dans la pratique créée. Changer V3 tarit la source ; les pratiques déjà créées en vue simple gardent le nom « Par standards » dans les données de chacun·e. La consigne dit qu'aucune donnée n'est réécrite : ce stock **reste**, et il faut l'assumer. Conséquence prévisible : quand le moteur par cibles livrera son modèle « Par standards », une personne pourra avoir côte à côte une ancienne pratique « Par standards » (productions retenues) et une nouvelle. Combien de personnes sont touchées : je ne peux pas le mesurer d'ici.

### Assistant de pratique — 6

| N° | Fichier : ligne | Où on le lit | Aujourd'hui | Proposé |
|---|---|---|---|---|
| A1 | `js/wizard-pratique-v2.js:52` (`label`) | récapitulatif, « Ta pratique de notation a été identifiée comme » | « PAN – Standards » | « PAN – Productions retenues » (description : § 4) |
| A2 | `js/wizard-pratique-v2.js:221` (`label`) | carte de la voie rapide | « PAN – Standards (STD) » | « PAN – Productions retenues (RET) » (description : § 4) |
| A3 | `js/wizard-pratique-v2.js:1933` | titre du récapitulatif | « Configuration PAN-Standards » | « Configuration PAN – Productions retenues » |
| A4 | `js/pratiques/pratique-registre.js:837` | étape « Approche », variante artefacts | « PAN-Standards s'appuie sur le portfolio : … » | « Cette pratique s'appuie sur le portfolio : … » |
| A5 | `js/pratiques/pratique-registre.js:852` | étape « Approche », sans artefact | « En PAN – Standards, la note repose sur plusieurs productions : à l'étape suivante, tu choisis lesquelles elle retient … » | ⟲ « Ici, la note repose sur plusieurs productions : à l'étape suivante, tu choisis lesquelles elle retient … » |
| A6 | `js/accompagnement-contenu-hover.js:481` | bulle de l'étape « Approche » | « En standards, la note se construit sur le portfolio ; … » | « Par productions retenues, la note se construit sur le portfolio ; … » |

### Fiche et bibliothèque des pratiques — 16

| N° | Fichier : ligne | Où on le lit | Aujourd'hui | Proposé |
|---|---|---|---|---|
| F1 | `index.html:5439` | encadré d'aide de la section Pratiques | « **STD** (Standards) permet d'attribuer une cote finale selon des seuils de performance. » | § 4 |
| F2 | `index.html:5498` | exemple grisé du champ « Nom » | « Ex: PAN-Standards Littérature » | « Ex: Productions retenues, Littérature » |
| F3 | `index.html:5507` | menu « Type » de la fiche ; **aussi** l'étape « Méthode » de la chaîne (`pratiques-gestion.js:1141` lit ce libellé) | « PAN-Standards » | « PAN – Productions retenues » |
| F4 | `index.html:5737` | encadré de la configuration | « **PAN-Standards** : la note retient les résultats de l'étudiant·e selon ta « Construction de la note » … » | « **PAN – Productions retenues** : la note retient les résultats … » (suite inchangée) |
| F5 | `js/pratiques-gestion.js:129` | description courte et méta de la bibliothèque | « PAN-Standards - Maîtrise de standards/objectifs » (+ « Standards-Based Grading ») | § 4 |
| F6 | `js/pratiques-gestion.js:191` | infobulle du badge | « PAN – Standards — niveaux de maîtrise (ex. I-D-M-E) convertis en note. » | § 4 |
| F7 | `js/pratiques.js:325` | nom de la pratique par défaut | « PAN-Standards » | « PAN – Productions retenues » |
| F8 | `js/pratiques/pratiques-predefines.js:24` | nom d'une pratique prédéfinie (affichage non confirmé) | « PAN-Standards (5 niveaux) » | « Productions retenues (5 niveaux) » |
| F9 | `js/pratiques/pratiques-predefines.js:361` | nom d'une pratique prédéfinie (affichage non confirmé) | « PAN-Standards (IDME + SRPNF) » | « Productions retenues (IDME + SRPNF) » |
| F10 | `js/pratiques/pratique-pan-standards.js:86` | nom de la pratique codée en dur : profil, export | « PAN-Standards » | « PAN – Productions retenues » |
| F11 | `js/pratiques/pratique-pan-standards.js:94` | sa description | « Pratique PAN-Standards (SBG) basée sur les N meilleurs artefacts de portfolio avec évaluation par niveaux de maîtrise et critères configurables. » | § 4 |
| F12 | `js/pack-demo-10.js:7409` | nom de la pratique du groupe de démonstration | « PAN – Standards (démo) » | « Productions retenues (démo) » |
| F13 | `js/gabarits-utils.js:201` | nom d'un gabarit de grille | « [STD] Grille par objectifs » | « [RET] Grille par objectifs » (suit le badge) |
| F14 | `js/gabarits-utils.js:203` | description du gabarit | « Gabarit PAN-Standards : Critères alignés sur les objectifs du cours » | « Gabarit PAN – Productions retenues : … » |
| F15 | `js/donnees-v2.js:1243` | type de pratique, écran Données (affichage non confirmé) | « PAN-Standards » | « PAN – Productions retenues » |
| F16 | `js/productions.js:2661` | aide du type « Évaluation terminale », fiche d'une production | « En PAN – Standards, elle entre dans le calcul avec sa pondération …, le reste allant aux artefacts du portfolio ou, sans artefact, aux productions retenues … » | ⟲ « Dans une pratique par productions retenues, elle entre dans le calcul avec sa pondération …, le reste allant aux artefacts du portfolio ou, sans artefact, aux autres productions que la règle retient … » |

⚠ **F12 : source ou stock.** Le pack de démonstration déjà chargé chez quelqu'un garde l'ancien nom. Un pack rechargé prend le nouveau.
⚠ **F8, F9, F13** sont des noms d'objets qu'une personne peut avoir copiés chez elle : même remarque, le stock reste.

### Tableau de notation — 1

| N° | Fichier : ligne | Où on le lit | Aujourd'hui | Proposé |
|---|---|---|---|---|
| T1 | `js/tableau-notation.js:42` | tableau, autre famille | « Le tableau de notation sert aux pratiques par standards et par spécifications. … » | « Le tableau de notation sert aux pratiques par productions retenues et par spécifications. … » |

Le badge « STD » y paraît aussi (`tableau-notation.js:471`) : il suit la décision du §2.

### Profil et liste des étudiant·es — 8

| N° | Fichier : ligne | Où on le lit | Aujourd'hui | Proposé |
|---|---|---|---|---|
| P1 | `js/profil-etudiant-actions.js:509` | profil, à côté de « Note finale de session », quand la pratique n'a pas de nom | « PAN-Standards » | « PAN – Productions retenues » |
| P2 | `js/profil-etudiant-actions.js:708` | idem, note calculée | « PAN-Standards » | « PAN – Productions retenues » |
| P3 | `js/profil-etudiant-sections-affichage.js:184` | profil, panneau de performance | « Performance du portfolio actuel (N meilleurs, maîtrise de standards) » | § 4 |
| P4 | `js/profil-etudiant-sections-affichage.js:3648` | profil, récit du calcul | même texte | § 4 |
| P5 | `js/profil-etudiant-sections-affichage.js:3963` | profil, note sur les indices | « Pratique de notation active : PAN-Standards » | « Pratique de notation active : PAN – Productions retenues » |
| P6 | `js/etudiants.js:378` | liste, encadré « Méthodes de calcul des indices » | « (pratique active : PAN-Standards) » | « (pratique active : PAN – Productions retenues) » |
| P7 | `js/etudiants.js:408` | même encadré | « → **PAN-Standards** : Moyenne des N meilleurs … selon l'échelle IDME. » | « → **PAN – Productions retenues** : … » (suite inchangée) |
| P8 | `js/etudiants.js:420` | même encadré | « … (Sommative, PAN-Standards, ou autre). » | « … (Sommative, PAN – Productions retenues, ou autre). » |

### Comparateur et Exploration — 1

| N° | Fichier : ligne | Où on le lit | Aujourd'hui | Proposé |
|---|---|---|---|---|
| C1 | `js/comparateur-pratiques.js:69` | note « en construction » de l'Exploration | « Pour certaines pratiques — surtout PAN-Standards — une note peut s'afficher à 0 … » | « Pour certaines pratiques – surtout PAN – Productions retenues – une note peut s'afficher à 0 … » |

Le menu des pratiques y imprime aussi le code (`comparateur-pratiques.js:741`, « STD · nom ») : il suit le badge.

### Aide et glossaire — 19

| N° | Fichier : ligne | Où on le lit | Aujourd'hui | Proposé |
|---|---|---|---|---|
| G1 | `index.html:5096` | encadré de la section Échelles | « … est utilisée dans la pratique PAN-Standards. » | « … est utilisée dans la pratique par productions retenues. » |
| G2 | `index.html:10247` | Aide, titre de carte | « PAN – Standards » | « PAN – Productions retenues » |
| G3 | `index.html:10287` | Aide, « ce que fait l'application » (texte validé le 29 oct.) | « **PAN – Standards.** Si ta pratique compte au moins une production … » | « **PAN – Productions retenues.** … » ; le corps ne change pas, il décrit déjà le calcul |
| G4 | `index.html:10756` | Aide, travail non remis | « … en standards hybride, une fois les notes finales cochées, … » | « … par productions retenues en mode hybride, une fois les notes finales cochées, … » |
| G5 | `index.html:10766` | Aide, copie non recevable | « en standards, elle sort du portfolio : … » | « par productions retenues, elle sort du portfolio : … » |
| G6 | `js/guides-pedagogiques.js:140` | guide, indice P | « … (Standards, Spécifications, Dénotation ou Sommative). » | « … (Productions retenues, Spécifications, Dénotation ou Sommative). » |
| G7 | `js/guides-pedagogiques.js:307` | guide PAN | « … elles certifient l'atteinte de standards ou d'objectifs … C'est le cas des pratiques Standards et Spécifications (page suivante). » | § 4 |
| G8 | `js/guides-pedagogiques.js:310` | guide PAN, astuce | « … Standards et Spécifications sont des PAN ; la dénotation est une PRÉN. » | § 4 |
| G9 | `js/guides-pedagogiques.js:317` | guide PAN, titre de page | « Les pratiques disponibles : Standards et Spécifications » | « Les pratiques disponibles : Productions retenues et Spécifications » |
| G10 | `js/guides-pedagogiques.js:320` | guide PAN, intertitre | « PAN-Standards (code STD, aussi appelée Maîtrise) » | § 4 |
| G11 | `js/guides-pedagogiques.js:321` | guide PAN, paragraphe | « Tu évalues par niveaux de maîtrise … En anglais : *Standards-Based Grading*. » | § 4 |
| G12 | `js/guides-pedagogiques.js:326` | guide PAN, astuce | « Le choix entre Standards et Spécifications n'a pas à être tranché … » | « Le choix entre Productions retenues et Spécifications n'a pas à être tranché … » |
| G13 | `js/accompagnement-contenu-terme.js:214` | glossaire, « Pratique de notation » | « … sommative (SOM), PAN par standards (STD), PAN par spécifications (SPE) et dénotation (DEN). » | « … sommative (SOM), PAN par productions retenues (RET), PAN par spécifications (SPE) et dénotation (DEN). » |
| G14 | `js/accompagnement-contenu-terme.js:471` | glossaire, entrée | « STD — PAN par standards » | « RET — PAN par productions retenues » (définition : § 4) |
| G15 | `js/accompagnement-contenu-terme.js:501` | glossaire, « PAN » | « Terme qui désigne les pratiques Standards (STD) et Spécifications (SPE). … » | § 4 |
| G16 | `js/accompagnement-contenu-popup.js:252` | fenêtre d'accompagnement | « **PAN par standards (STD)** — retient les meilleures démonstrations de compétence ; … » | § 4 |
| G17 | `js/accompagnement-contenu-hover.js:316` | bulle des codes | « … STD = PAN basée sur des standards (par maîtrise), … » | § 4 |
| G18 | `js/evaluation-sauvegarde.js:583` | bulle « copie non recevable », écran d'évaluation | « … un travail non satisfaisant en spécifications, hors du portfolio en standards. … » | « … un travail non satisfaisant en spécifications, hors du portfolio par productions retenues. … » |
| G19 | `js/init-inline.js:580` | mots-clés de la recherche de l'aide | `'standards'` | ajouter `'productions retenues'` et GARDER `'standards'` : une personne qui cherche l'ancien mot doit encore trouver |

**Ne change pas** : `index.html:9891`, « Une référence majeure sur les pratiques de notation par standards et par spécifications ». La phrase parle de la recherche, au sens que Grégoire veut rendre au mot.

### Parcours, sur main — 8

| N° | Fichier : ligne | Où on le lit | Aujourd'hui | Proposé |
|---|---|---|---|---|
| R1 | `js/parcours-evaluer.js:853` | parcours Évaluer, bulle « pratique » | « … ton modèle y est aussi : par standards (niveaux de maîtrise), par spécifications, par dénotation. » | « … par productions retenues (des niveaux, dont la note retient certains), par spécifications, par dénotation. » |
| R2 | `js/parcours-evaluer.js:1356` | parcours Évaluer, essai guidé | « … : le modèle par standards, où la note vient des niveaux de maîtrise. » | « … : le modèle par productions retenues, où la note vient des niveaux des productions que la règle retient. » |
| R3 | `js/parcours-notation-alternative.js:39` | ligne de présentation du parcours | « De ta pratique par standards, spécifications ou dénotation à la synthèse … » | « De ta pratique par productions retenues, spécifications ou dénotation à la synthèse … » |
| R4 | `js/parcours-notation-alternative.js:46` | étape 1 (deux segments) | « Par standards, la note retient certaines productions selon une règle … » ; « … « N plus récentes » pour les standards, … » | ⟲ « Par productions retenues, la note en garde certaines selon une règle … » ; « … « N plus récentes » pour les productions retenues, … » |
| R5 | `js/parcours-notation-alternative.js:56` | étape 3 | « En standards, la note repose sur les productions que tu tiens pour représentatives … » | « Par productions retenues, la note repose sur celles que tu tiens pour représentatives … » |
| R6 | `js/parcours-notation-alternative.js:76` | étape de la synthèse | « … et, en standards, à la note provisoire ; … » | « … et, par productions retenues, à la note provisoire ; … » |
| R7 | `js/parcours-notation-alternative.js:91` | étape du PDF | « En standards, elle montre aussi une « Note provisoire » : … » | « Par productions retenues, elle montre aussi une « Note provisoire » : … » |
| R8 | `js/parcours-notation-alternative.js:96` | dernière étape | « … ; en standards, la synthèse s'intitule alors « Note finale » … » | « … ; par productions retenues, la synthèse s'intitule alors « Note finale » … » |

### PDF de synthèse — 0 · lu par les étudiant·es

**Aucune ligne du PDF ni de la synthèse ne nomme cette pratique ni sa famille.** Mesuré : `js/synthese-retroaction-data.js`, `js/synthese-retroaction-rendu.js`, `js/export-pdf.js` et `js/profil-etudiant-rapport.js` ne portent ni « PAN- », ni le nom de la pratique (`pratiqueNom`), ni « standards » comme nom de pratique. La légende de la bande (`synthese-retroaction-rendu.js:210`, « Plein : compte dans ta note ») ne la nomme pas.

**À ne pas toucher, lu par les étudiant·es** : « Mes standards sont très élevés à ton égard … » (`js/synthese-retroaction-data.js:870`, `js/evaluation-retroaction.js:1506`). Le mot y a son sens courant d'exigence, sans lien avec la pratique. Un remplacement automatique le casserait : c'est la seule ligne lue par les étudiant·es que ce lot pourrait abîmer.

### Exports — 2

| N° | Fichier : ligne | Où on le lit | Aujourd'hui | Proposé |
|---|---|---|---|---|
| E1 | `js/export-resultats-finaux.js:157` | CSV « Résultats finaux », colonne « Pratique (nom) », pratique codée en dur | « PAN-Standards » (vient de F10) | suit F10 |
| E2 | `js/export-resultats-finaux.js:156` | même CSV, colonne « Pratique (code) » | « STD » | **inchangé** (hypothèse du §2) |

### Messages d'erreur — 6

| N° | Fichier : ligne | Où on le lit | Aujourd'hui | Proposé |
|---|---|---|---|---|
| M1 | `js/wizard-pratique-v2.js:2456` | notification de l'assistant | « … avant de créer cette pratique PAN-Standards. … » | « … avant de créer cette pratique par productions retenues. … » |
| M2 | `js/profil-etudiant-actions.js:155` | profil, note non calculable | « … se calcule par portfolio, propre aux PAN-Standards : … » | « … propre aux pratiques par productions retenues : … » |
| M3 | `js/profil-etudiant-actions.js:174` | idem | « Pratique PAN-Standards, mais la carte « Structure des évaluations » … » | « Pratique par productions retenues, mais la carte … » |
| M4 | `js/profil-etudiant-actions.js:176` | idem | « Pratique PAN-Standards, mais sa configuration de portfolio … » | « Pratique par productions retenues, mais sa configuration … » |
| M5 | `js/pratiques/pratique-registre.js:933` | profil et tableau, terminale seule | « Seule l'évaluation terminale a une note. En standards, la note du cours s'appuie aussi sur les productions retenues … » | ⟲ « Seule l'évaluation terminale a une note. Dans ta pratique, la note du cours s'appuie aussi sur les productions retenues … » |
| M6 | `js/pratiques/pratique-configurable.js:133` | message de résolution | « Une pratique par standards lit sa note globale dans l'échelle de ses évaluations, … » | « Une pratique par productions retenues lit sa note globale … » |

## 4. Les phrases qui décrivent la pratique au sens de la recherche — 15 sur main

Elles disent « maîtrise de standards », « *Standards-Based Grading* » ou « démonstration de compétence ». Ce que le calcul fait : des productions évaluées par niveaux, dont une règle retient certaines (les meilleures, les plus récentes ou toutes) pour construire la note.

| N° | Renvoi | Aujourd'hui | Réécriture proposée |
|---|---|---|---|
| D1 | F1 | « **STD** (Standards) permet d'attribuer une cote finale selon des seuils de performance. » | « **RET** (Productions retenues) : chaque production reçoit un niveau, et la note se construit à partir de celles que ta règle retient. » |
| D2 | F5 | « PAN-Standards » · « Standards-Based Grading » · « Maîtrise de standards/objectifs » | « PAN – Productions retenues » · sans équivalent anglais · « Productions évaluées par niveaux, dont certaines sont retenues » |
| D3 | F6 | « PAN – Standards — niveaux de maîtrise (ex. I-D-M-E) convertis en note. » | « PAN – Productions retenues : des niveaux (ex. I-D-M-E), dont la note retient certains. » |
| D4 | A1 | « Tu évalues par niveaux de maîtrise (ex. : I-D-M-E). La note est construite à partir de la démonstration de compétences, pas d'une simple moyenne. » | « Tu évalues chaque production par niveaux (ex. : I-D-M-E). La note se construit à partir des productions que ta règle retient, pas de la moyenne de toutes. » |
| D5 | A2 | « Niveaux de maîtrise (ex. I-D-M-E) convertis en note. » | « Des niveaux (ex. I-D-M-E), dont la note retient certains. » |
| D6 | F11 | « Pratique PAN-Standards (SBG) basée sur les N meilleurs artefacts de portfolio … » | « Pratique par productions retenues : la note repose sur les N meilleurs artefacts du portfolio, évalués par niveaux, avec des critères configurables. » |
| D7 | P3, P4 | « Performance du portfolio actuel (N meilleurs, maîtrise de standards) » | « Performance du portfolio actuel (N meilleurs retenus) » |
| D8 | G7 | « … elles certifient l'atteinte de standards ou d'objectifs à la fin du parcours. … C'est le cas des pratiques Standards et Spécifications (page suivante). » | Garder la première phrase : elle décrit les PAN en général, au sens de la recherche. Remplacer la dernière : « Dans Labo Codex, deux pratiques s'en inspirent : Productions retenues et Spécifications (page suivante). » |
| D9 | G8 | « La recherche est plus précise : Standards et Spécifications sont des PAN ; la dénotation est une PRÉN. » | « La recherche est plus précise : la notation par standards et la notation par spécifications sont des PAN ; la dénotation est une PRÉN. » Phrase vraie au sens de la recherche : c'est la majuscule, qui en faisait un nom de pratique de l'application, qui part. |
| D10 | G10, G11 | « PAN-Standards (code STD, aussi appelée Maîtrise) » · « Tu évalues par niveaux de maîtrise … C'est la transposition, au collégial, de … *bulletin descriptif* … En anglais : *Standards-Based Grading*. » | « PAN – Productions retenues (code RET) » · « Tu évalues chaque production par niveaux (par exemple l'échelle IDME …). La note se construit à partir des productions que ta règle retient : les meilleures, les plus récentes ou toutes. » **Question pour Grégoire** : la citation du Conseil supérieur et « *Standards-Based Grading* » restent-elles ici, ou attendent-elles la pratique par cibles ? Je ne tranche pas : c'est de la didactique. |
| D11 | G14 | définition de « STD — PAN par standards » : « … compose la note à partir des démonstrations de compétence que retient sa configuration. L'étudiant·e progresse en montrant sa maîtrise, pas en accumulant des points. … » | « Pratique alternative de notation où chaque production reçoit un niveau. La note se construit à partir des productions que retient la règle : les meilleures, les plus récentes ou toutes. Une production plus récente ou mieux réussie peut en remplacer une autre, selon la règle. » |
| D12 | G15 | « Terme qui désigne les pratiques Standards (STD) et Spécifications (SPE). … » | « Terme qui désigne les pratiques Productions retenues (RET) et Spécifications (SPE). … » (suite inchangée) |
| D13 | G16 | « **PAN par standards (STD)** — retient les meilleures démonstrations de compétence ; l'étudiant·e progresse en montrant sa maîtrise, pas en accumulant des points. » | « **PAN par productions retenues (RET)** : chaque production reçoit un niveau, et la note retient celles que ta règle désigne ; l'étudiant·e progresse d'une production à l'autre, sans accumuler de points. » |
| D14 | G17 | « STD = PAN basée sur des standards (par maîtrise) » | « RET = PAN par productions retenues (des niveaux, dont certains comptent) » |
| D15 | skill `pratiques-notation`, `SKILL.md:95` (et le tableau l. 52) | « **STD — Standards (par standards / par objectifs)** » | « **STD — Productions retenues (affichée « Par standards » jusqu'au 26 nov. 2026)** », avec une ligne qui dit que le mot « standards » revient au moteur par cibles. Le §2 bis du skill documente déjà l'écart entre le code et la recherche : son fond ne change pas. |

## 5. Les branches de parcours — à part, avec l'accord de Grégoire

⚠ `lot/essai-20-nov` **n'existe pas sur origin**. J'ai mesuré la branche qui porte ce travail : `origin/claude/essai-parcours-20-nov-k85n8g` (`c5ab529a`, 90 commits devant main). À confirmer que c'est bien celle que la consigne visait.

Les huit lignes de main (R1 à R8) s'y retrouvent, décalées. S'y ajoutent, dans `js/parcours-evaluer.js` :

| Bulle | `origin/apercu/essai-parcours` (`90cb3c2a`) | `origin/claude/essai-parcours-20-nov-k85n8g` | Aujourd'hui | Proposé |
|---|---|---|---|---|
| B1 | l. 1231 | l. 1343, et l. 704 (même phrase, en note) | « Le code à côté du nom dit sa famille : SOM pour la sommative, STD pour les standards ; … » | « … SOM pour la sommative, RET pour les productions retenues ; … » (suit le badge) |
| B2 | l. 1232 | l. 1344 | « L'exemple prend « N meilleures évaluations », par standards : chaque production reçoit un niveau de maîtrise et la note retient les 7 meilleures évaluations sur 10 » | « … « N meilleures évaluations », par productions retenues : chaque production reçoit un niveau et la note retient les 7 meilleures évaluations sur 10 » |
| B3 | l. 1238 | l. 1350 | « Le récapitulatif dit sa famille et ce qu'elle fait : « PAN – Standards » (PAN : pratique alternative de notation) » | « … : « PAN – Productions retenues » (PAN : pratique alternative de notation) » ; doit suivre A1 mot pour mot |
| B4 | l. 1248 | l. 1360 | « Par standards, tu ne comptes pas de points : tu situes ce que l'étudiant·e a réussi à un niveau » | « Par productions retenues, tu ne comptes pas de points : tu situes ce que l'étudiant·e a réussi à un niveau » |

Soit 4 bulles sur la première branche et 5 lignes sur la seconde. Sur `apercu/essai-parcours`, R2 (l'essai guidé, l. 1356 de main) a disparu, remplacé par ces bulles. Je ne sais pas lesquelles de ces bulles Grégoire a validées le 20 nov. : la consigne dit « dont des bulles validées », sans les désigner.

## 6. Ce qui casserait

**50 lignes dans 26 fichiers de bancs épinglent un de ces textes** (hors commentaires et titres de tests), dont 17 lignes dans 6 fichiers Playwright. Les plus chargés :

| Fichier | Lignes | Ce qu'il tient |
|---|---|---|
| `integration/bibliotheque-deux-colonnes-1156.spec.js` | 8 | « PAN – Standards (démo) », « PAN-Standards - Maîtrise de standards/objectifs » (F5, F12) |
| `integration/vue-simple.spec.js` | 5 | « Par standards », « Par standards (active) », V2, V6 |
| `unit/vue-simple.test.js` | 3 | le nom « Par standards » passé au modèle |
| `unit/sentinelle-standards-sans-portfolio.test.js` | 3 | M5 (deux variantes), A4 |
| `unit/sentinelle-lot-29-cinq-textes-901-899.test.js` | 3 | G6, G15 |
| 21 autres fichiers | 1 ou 2 chacun | F3, F10, E1, G5, G18, A6, T1, R6, R7, R8, le badge |

Trois choses que ce compte ne dit pas :
- **Les sentinelles qui relisent des textes validés.** `unit/sentinelle-aide-2026-10-28-lot-4.test.js` compare l'Aide aux paragraphes de `plans de travail/TEXTES-2026-10-29-standards-lot-5.md`. Changer G3 demande un nouveau fichier de textes validés, pas seulement une retouche du banc.
- **Les sentinelles de compte** (`sentinelle-note-provisoire-reservee.test.js`) épinglent R6 et R7 par un fragment et un nombre d'occurrences.
- **Les 189 fichiers** qui disent « standards » ne cassent pas pour autant : la grande majorité tient l'identifiant `'standards'`, des noms fictifs (« Standards fictifs ») ou des commentaires, que la consigne laisse en place.

Je n'ai lancé aucun banc : ces comptes viennent de la lecture, pas d'un rouge observé.

## 7. Une ligne de Nouvelles, proposée à Grégoire

> La pratique « Standards » s'appelle maintenant « Par productions retenues ». Le nom dit ce que fait le calcul : chaque production reçoit un niveau, et la note se construit à partir de celles que ta règle retient. Tes pratiques, tes réglages et tes notes ne changent pas. Une pratique que tu avais nommée toi-même garde son nom.

## 8. Estimation pour le 26 novembre

**Le lot entier tient dans la fenêtre, à une condition qui ne dépend pas du code** : la relecture de Grégoire. Il y a 73 textes et 15 réécritures à approuver, plus 4 ou 5 bulles sur les branches.

- Le code : une journée de travail. 73 remplacements dans 27 fichiers, le champ `badge`, 50 lignes de bancs, un fichier de textes validés, puis le verdict Vitest et Playwright (plus de dix minutes).
- Pour un verdict le 26 vers midi, il faut les textes approuvés **au plus tard le 24 au soir**. C'est une inférence sur ma vitesse, pas une mesure.

**Si la relecture ne peut pas être complète, le sous-ensemble qui suffit pour le 27** tient en 17 textes : la vue simple (V1 à V6), l'assistant (A1 à A6, D4, D5, M1), le tableau (T1) et M5, que la vue simple peut montrer. Le badge peut attendre : la vue simple ne l'affiche que dans le tableau. Environ 15 lignes de bancs. Une demi-journée, verdict compris.

**Hypothèse à confirmer** : « l'aide de la page d'accueil » de la consigne. Je n'ai pas su dire avec certitude quel texte elle désigne. Si c'est le glossaire et les bulles d'accompagnement, ajouter G13 à G17 (cinq textes, dont quatre réécritures).

**Le risque du sous-ensemble** : pendant quelques jours, la vue simple dirait « Par productions retenues » et la vue étendue « PAN-Standards » pour la même pratique. Une collègue qui passe de l'une à l'autre le verra.

## 9. Dispositions

| Constat | Disposition |
|---|---|
| Les 73 textes, les 15 réécritures, les bulles des branches | en attente du oui de Grégoire, texte par texte |
| « Les productions retenues » est déjà un nom commun (§1) | remonte à Grégoire : le nom est « pour l'instant » |
| Le stock des pratiques déjà nommées « Par standards » (V3) | assumé par la consigne (aucune donnée réécrite) ; à écrire dans le rapport du lot d'application |
| Citation du Conseil et « *Standards-Based Grading* » (D10) | question de didactique, pour Grégoire |
| `lot/essai-20-nov` introuvable sur origin | à confirmer par Cowork |
| Colonne « Pratique (code) » de l'export | hypothèse : inchangée |
