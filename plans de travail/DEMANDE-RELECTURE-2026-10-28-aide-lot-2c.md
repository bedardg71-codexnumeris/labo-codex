# Demande de relecture – L'Aide, lot 2c : l'Évaluation (#1152)

> Claude Code, mercredi 28 octobre 2026, sur `main` (base `c83fb744`, le commit de docs du § 0). Consigne : `CONSIGNE-LOT-2026-10-28-aide-lot-2c-evaluation.md`. Non poussé, pas de release.
> Les preuves dans `js/` et `index.html` hors de l'Aide sont au HEAD (le code n'est pas touché par ce lot : les lignes des écrans, avant la section Aide, n'ont pas bougé).

## En bref

- L'Évaluation garde **6 entrées** : `evaluer-productions` est absorbée par `annoter-evaluer`, et `liste-evaluations`, neuve, se place en tête.
- **1 735 mots → 1 327** (−24 %). Mesure : le texte visible de chaque carte, titre et ligne « Navigation » compris, commentaires retirés. Ce compte est plus serré que celui de la consigne (1 956 au départ, même périmètre) : à la même échelle, l'arrivée ferait environ 1 500, pour une cible d'environ 1 200. L'écart tient à trois entrées :
  - `annoter-evaluer` (380, cible ~300 en compte de Cowork) : le geste du barème, la note remise, la case « Incomplet », la règle du badge « Évalué » et la phrase des codes sont des ajouts demandés ;
  - `irrecevables` (357, cible ~290) : les quatre lignes par famille (~95 mots) et le bloc « Travail INCOMPLET » restent, le second resserré de 60 à 35 mots ;
  - `preparer-importer` (221, cible ~180) : le paragraphe des remises en plusieurs fichiers, gardé mot pour mot (`sentinelle-878`), en pèse 55.
- **Aucun fichier `js/` touché** ; `js/config.js` et `js/navigation.js` non plus. Pas de bloc de jetons à refaire.
- Tests :
  - Vitest complet : **9 992 sur 9 992** (9 983 + les 9 de la sentinelle neuve) ;
  - sentinelles de l'Aide : 205 sur 205 ;
  - Playwright ciblé : 8 sur 8 (la spec neuve, `aide-forme-1152`, `bareme-2-aide`, `aide-exporter-archiver-893`, `aide-lot-2a-1152`, `aide-lot-2b-1152`). Le verdict complet n'est pas lancé.
- **Mesuré à l'écran avant d'écrire**, comme la consigne le demande : le badge « Évalué » ne dépend pas du verrouillage (sonde Playwright, détail au § Preuves).

## Entrée par entrée

| # | Id | Titre | Mots avant → après | Ce qui a changé |
|---|---|---|---|---|
| 1 | `liste-evaluations` | **La liste des évaluations** (neuve) | 0 → 119 | Une rangée par copie attendue ; « Statut », « Non verrouillée », « Jeton » ; le filtre « Statut » isole aussi les jetons. Le menu « Actions » (quatre libellés cités, pas tous) ; « Réassigner » ouvre les « Propriétés du fichier ». « Supprimer » et « Mettre à la corbeille (N) » ; « Corbeille (N) », restaurables 30 jours. |
| 2 | `preparer-importer` | Préparer et importer les travaux | 276 → 221 | « Mode Léa / Mode Libre » → « LEA » et « Autre », à l'étape « Optimisation ». La zone dit ses formats (plus de liste dans l'Aide). HEIC : décodé en ligne, impossible depuis le disque. Quatre pastilles, « Incomplet » d'abord. « Modifier un document » → « Actions ▾ › Modifier » ou « Modifier » dans la Liste. Le stockage sur disque dépend du navigateur. Gardés : « 1. Déposer les fichiers : », le « 2. » qui suit, le paragraphe des remises. |
| 3 | `annoter-evaluer` (+ `evaluer-productions`) | Annoter et évaluer un travail | 353 + 101 → 380 | « Crayon », « Surlignage », « Autocollants », les symboles et les préréglages de zoom corrigés (« Stylo », « Surligneur », « Formes », « Tampons », Crochet, Croix, Interrogation, « 100 % » et le plein écran). Les codes en une phrase, avec renvoi. Le barème (H1 à H4), la note remise, la case « Incomplet », la règle du badge « Évalué », le bouton de la palette caché sans évaluation. De `evaluer-productions`, la phrase sur C et P seule, réécrite. « Bon à savoir » retiré (il redisait le panneau). |
| 4 | `jetons-reprise` | **Utiliser les jetons** (titre neuf) | 239 → 156 | Régler (« Activer le système de jetons », plafond, 2 par défaut, délai, reprise, « Garder l'original » ou « Supprimer ») ; appliquer (trois chemins, plus le doublon à l'import) ; les badges, « Délai » compris. « Reprise ciblée », « Approche stratégique » (D2) et les couleurs retirés. |
| 5 | `irrecevables` | **Copies non remises, non recevables, soupçonnées ou incomplètes** (titre neuf) | 612 → 357 | Quatre situations, une ligne chacune ; « Non reçu » et « -- » dans la Liste, « Non remis » dans le profil ; le non-remis et la note dits selon la pratique ; libellés du menu recopiés. Procédure en un paragraphe. « Principe clé », le tableau chiffré et ses résultats retirés. Gardés mot pour mot : le sous-titre « Travail NON RECEVABLE (Plagiat ou IA) », les quatre lignes par famille, « 7/9 ». |
| 6 | `exporter-archiver` | Exporter les travaux | 154 → 94 | Les descriptions des deux cartes et la phrase sur l'espace de stockage resserrées. Gardés : les deux cartes en `<li><strong>`, « Compresser le ZIP », « Reprises seulement », « le bloc au bas de l'écran ». |

**« Incomplet », deux sens** : non tranché. Les libellés sont ceux de l'écran (« Incomplet ; travail en cours », la pastille « Incomplet »).

**D2 ailleurs** : rien dans l'Évaluation. Les deux phrases visées (la correction du français, « 15-30 min par production ») partent avec `evaluer-productions`.

## Preuves (fichier:ligne)

### `liste-evaluations`
- Colonnes « Jeton », « Statut », « Note % » : `index.html:8319-8330` ; badges dans « Jeton », pastille dans « Statut » : `js/liste-evaluations.js:1646-1649`.
- Pastilles : `js/liste-evaluations.js:137-150` ; « Non verrouillée : ne compte pas encore dans la note. » : `1592`.
- Filtre « Statut » et ses options de jetons : `index.html:8223-8241` ; « Recherche » : `8242`.
- Menu d'une rangée, options conditionnelles : `js/liste-evaluations.js:1708-1810` (`genererDropdownActions`) ; « Modifier » ouvre l'éditeur (`editer`) : `1752` ; « Réassigner » / « Assigner » : `1782-1783`, qui ouvre les Propriétés : `1851` ; « Propriétés du fichier » et ses champs : `2053-2069`.
- « Mettre à la corbeille (N) » : `js/liste-evaluations.js:715` ; la question puis l'écriture : `1026-1062` ; « Corbeille (N) » : `2925` ; « Tu pourras les restaurer depuis la corbeille pendant 30 jours. » : `993` ; la durée : `js/travaux-stockage.js:1013`.

### `preparer-importer`
- « Sélection des fichiers » et les formats lus par la zone : `js/travaux-ui.js:1000, 1006`, `formatsAcceptesLibelle` `878-883` (HEIC seulement s'il se décode).
- « Optimisation », « LEA » / « Autre », champs remplis en LEA : `js/travaux-ui.js:1018, 2045-2061` ; « Importer » : `1026`.
- Quatre pastilles, « Incomplet » d'abord : `js/travaux-ui.js:2697-2711`.
- « Actions ▾ › Modifier » : `js/travaux-ui.js:1184-1189` ; « Modifier » dans la Liste : `js/liste-evaluations.js:1752`.
- « Configurer le stockage sur disque » et le navigateur qui décide : `js/travaux-ui.js:884-893, 984`.

### `annoter-evaluer`
- Tableau d'entrée, filtres, bouton « Annoter » : `js/travaux-ui.js:2969-3017, 3060`.
- « 100 % » et plein écran : `js/travaux-ui.js:1221, 7631-7642`.
- Outils et formes : `js/travaux-outils.js:160-245` (« Sélection », « Stylo », « Surligneur », « Texte », « Cercle », « Ligne », « Rectangle », « Vague », « Pointillé ») ; section « Formes » : `1993-1998` (libellé `1995`).
- Symboles dans la palette des tampons : `js/travaux-outils.js:253-277, 1525-1543` ; palette « Tampons » : `516`.
- Codes d'office, case des critères plus anciens, codes au premier critère : `js/grilles.js:4017-4040, 4060-4076` ; « Personnaliser » : `js/travaux-outils.js:1579`.
- Barème : `js/evaluation-chargement.js:1747-1764, 1782, 1807-1823` ; mots validés : `TEXTES-2026-10-27-bareme-evaluation.md` (H1 à H4).
- Note remise : `js/evaluation-calcul.js:1430-1436` (`ligneNoteRemise`) ; déverrouillée, calcul à l'écran sans écriture : `1531-1541` (`afficherCalculActuel`). Concorde avec D8 de `sous-criteres` (« Elle ne suit le nouveau calcul que si tu la déverrouilles et la modifies ») : la note enregistrée ne change qu'au premier geste.
- Témoin « Enregistré » : `js/temoin-enregistrement.js:157`.
- Bouton de la palette caché sans évaluation : `js/travaux-outils.js:1947-1950` ; `js/evaluation.js:2384-2390`.
- Case « Incomplet ; travail en cours » : `index.html:8501-8506`.
- **Le badge « Évalué », mesuré à l'écran** : `statutPastilleFichier` (`js/travaux-ui.js:2702-2706`) lit « Évalué » dès que l'évaluation a un critère. Sonde Playwright (WebKit, retirée après la mesure), sur le banc de `statut-incomplet-travail-en-cours.spec.js` : un seul critère mis à « M », sans verrou, puis l'enregistrement automatique. Mesuré : copie `{ noteFinale: 80, verrouillee: false }` ; dans le tableau d'Annoter et évaluer, la pastille dit « Évalué » ; dans la Liste, « Non verrouillée ». La copie ouverte garde « EN COURS » tant qu'on ne la quitte pas (`afficherPastilleActive`, `js/travaux-ui.js:2721-2733`) : l'entrée dit « la copie se dit « Évalué » ici », sans préciser ce dernier cas.
- C et P : calculés par la pratique active (`js/pratiques/pratique-sommative.js:73-109`, et les autres familles) ; comparaison du 15 oct., Q5-10 et Q5-12.

### `jetons-reprise`
- « Système de jetons », « Activer le système de jetons », plafond `value="2"` : `index.html:6045, 6063, 6073-6075` ; délai et reprise : `6084-6127`.
- « Appliquer un jeton : » : `index.html:8512` ; Propriétés : `js/liste-evaluations.js:2003` ; à l'import : `js/travaux-ui.js:2076, 4366`.
- Badges « Remplacée », « Reprise » (« était … »), « Délai » : `js/liste-evaluations.js:1550-1575` ; « À réévaluer » : `1583-1586`.

### `irrecevables`
- « Non reçu » : `js/liste-evaluations.js:140` ; « -- » : `1598-1603` ; « 0 » sous « Statut » : `1588-1589` ; badges « Non recevable (Plagiat) », « Non recevable (IA) », « À vérifier » : `1525-1527`.
- « Non remis » dans le profil : `js/profil-etudiant-sections-affichage.js:3146-3151`.
- Le non-remis hors de la note sommative : `js/pratiques/pratique-sommative.js:84-88` (seules les évaluations qui entrent dans la note) ; l'obligatoire non remise en standards hybride : `js/profil-etudiant-actions.js:236-251` (dossier d'audit).
- Libellés du menu : `index.html:8485-8490`.

## Les ids

`evaluer-productions` disparaît. Lecteurs mesurés avant : `index.html` (l'entrée), `tests/unit/sentinelle-aide-2026-10-24-forme.test.js:83`. Aucun dans `js/`. Les titres de `jetons-reprise` et d'`irrecevables` changent ; aucun lecteur ne les cite (l'infobulle `eval-integrite` cite le sous-titre « Travail NON RECEVABLE », inchangé : `js/accompagnement-contenu-hover.js:366`). Le renvoi de `bareme` vers « Annoter et évaluer un travail » tient : ce titre ne change pas.

## Tests

### Neufs
- `tests/unit/sentinelle-aide-2026-10-28-lot-2c.test.js`, 9 essais, calculés des deux côtés : l'ordre des six entrées et l'absence d'`evaluer-productions` ; les mots interdits ; chaque libellé entre « » de `liste-evaluations`, `annoter-evaluer` et `jetons-reprise` cherché dans `index.html` hors de l'Aide et dans `js/` (65 morceaux ; « (N) », « … » et « › » découpés) ; le geste du barème contre H1 et `TEXTES_BAREME_EVAL` ; la ligne de la note remise contre `ligneNoteRemise` ; la phrase sur C et P ; le plafond contre `#mat-jetons-nombre` ; les 30 jours contre `DUREE_CORBEILLE_MS` ; les quatre sous-titres d'`irrecevables` et celui que cite l'infobulle.
  - **Break-test** : dix mutations d'`index.html`, une par affirmation (l'ordre, « Crayon », un libellé, H1, la note remise, C et P, le plafond, les 30 jours, un sous-titre, la marque « hors barème ») ; chacune rougit son essai (1 à 4 échecs). Arbre restauré, sha256 identique.
- `tests/integration/aide-lot-2c-1152.spec.js` : la recherche de l'Aide trouve « corbeille » dans `liste-evaluations`, « tranche », « note remise » et « barème » dans `annoter-evaluer` ; `evaluer-productions` ne sort plus. `CAPTURES_AIDE_2C=<dossier>` prend les captures. Break-test : « note remise » retiré de l'entrée, l'essai rougit (« Error: note remise ») ; restauré, sha256 identique.

### Modifiés, par décision
- `tests/unit/sentinelle-aide-2026-10-24-forme.test.js` : l'Évaluation passe à `liste-evaluations, preparer-importer, annoter-evaluer, jetons-reprise, irrecevables, exporter-archiver` ; `ABSORBEES_2C` et `NEUVES_2C` entrent dans les comptes (75 entrées à l'audit, toujours). Motif cité dans le fichier : verdict final d'`evaluer-productions` (« Fusionner »), remesure (geste neuf n° 7), consigne § 2.

### Un piège évité
- Mes premiers commentaires HTML recopiaient « Une remise en plusieurs fichiers » et « Travail NON RECEVABLE » → « Travail SOUPÇONNÉ » : les bancs 878 et du 15 oct. tranchent sur la première occurrence et sont tombés (6 rouges). Les commentaires ont été reformulés ; aucune assertion n'a été touchée.

### Résultats
- Vitest complet, depuis `tests/` : 837 fichiers, **9 992 sur 9 992**.
- Playwright ciblé : 8 sur 8.

## Pour Grégoire

Toutes les phrases de `liste-evaluations`, les titres neufs, et les phrases des autres entrées qui disent l'application au-delà d'un libellé.

### Les titres neufs
- `liste-evaluations` : « La liste des évaluations ».
- `jetons-reprise` : « Utiliser les jetons » (au lieu de « Utiliser les jetons de reprise » ; l'entrée couvre aussi le délai).
- `irrecevables` : « Copies non remises, non recevables, soupçonnées ou incomplètes » (au lieu de « Gestion des travaux irrecevables et non-remis », qui ne nommait ni le soupçon ni l'incomplet). Proposition de Claude Code ; repli possible : l'ancien titre plus « ou incomplets ».

### `liste-evaluations`, toutes ses phrases
1. « Une rangée par copie attendue. « Statut » porte sa pastille, de « Non reçu » à « Évalué » ; une copie « Non verrouillée » ne compte pas encore dans la note. « Jeton » porte les badges des jetons et de l'intégrité. Le filtre « Statut » isole aussi les jetons. »
2. « Le menu « Actions » d'une rangée n'offre que ce que la copie permet : « Évaluer », « Annoter », « Consulter », « Modifier » (l'éditeur de pages)… « Réassigner » ouvre les « Propriétés du fichier » : l'étudiant·e, la production et l'évaluation de la copie. »
3. « « Supprimer », sur une rangée, ou « Mettre à la corbeille (N) », sur les rangées cochées, envoie les copies à la corbeille, après une question. « Corbeille (N) », près des filtres, les montre : elles s'y restaurent pendant 30 jours. »

### Les autres entrées
- **`annoter-evaluer`**, le badge : « Dès qu'un critère porte un niveau, la copie se dit « Évalué » ici, « Non verrouillée » dans la Liste des évaluations : elle ne compte pas encore dans la note. »
- **`annoter-evaluer`**, la note remise : « Verrouillée, la copie montre la note remise, et la ligne « Note remise : … Avec le calcul actuel de la grille, elle serait de … » si le calcul actuel en donnerait une autre. Pour la corriger, déverrouille-la : elle montre la note du calcul actuel, et rien ne s'enregistre avant ton premier geste. »
- **`annoter-evaluer`**, C et P : « La complétion (C) et la performance (P) viennent de tes évaluations : la pratique de notation active les calcule. »
- **`annoter-evaluer`**, la case : « Cochée, « Incomplet ; travail en cours » met la copie de côté, sans note ni jeton, et elle garde sa pastille « Incomplet » »
- **`annoter-evaluer`**, les codes : « Les sous-critères d'un critère algorithmique sont ses codes d'office (la case « Utiliser ces sous-critères comme codes d'annotation » ne reste que sur les critères plus anciens) ; avec deux critères algorithmiques, les codes vont au premier. »
- **`irrecevables`**, le non-remis : « La note dépend de ta pratique : en sommative, il n'y entre pas ; en standards hybride, une fois les notes finales cochées, une obligatoire non remise vaut 0. » Deux familles sur quatre, nommées à titre d'exemple ; les spécifications et la dénotation ne sont pas dites (dossier d'audit, `irrecevables`, « Non-remis et P »).
- **`irrecevables`**, le bloc « Travail INCOMPLET », resserré : « … met de côté une copie inachevée : sans note, hors de la note, sans jeton, elle compte comme remise dans la complétion (C) jusqu'à ce que tu décoches la case pour évaluer la copie terminée. »
- **`preparer-importer`** : « Selon le navigateur, « Configurer le stockage sur disque » range aussi les copies dans un dossier de ton ordinateur ; ni Safari, ni Firefox, ni une tablette ne l'offrent. »

## Trouvé en chemin

- **Inscrire et continuer** (tableau « Trouvé hors de la section Aide », lot 5) : à l'import, le menu de production d'un fichier porte l'étiquette « Modifier » (`js/travaux-ui.js:2072`), suivie de « Ce fichier seulement — le sélecteur global « Production » ne l'écrasera pas. » L'Aide le nomme « le menu de production d'un fichier », sans citer l'étiquette.
- **Déjà inscrit** : le filtre « Statut » de la Liste offre encore « Jeton de reprise ciblée » (`index.html:8236`) ; c'est le constat « Reprise ciblée » du lot 5 (#563).
- **À noter pour Cowork, hors lot** : l'instable `presences-lot-d-enregistrement` (g), troisième verdict de suite selon l'audit de début de session ; non inscrit, le tri revient à Cowork et à Grégoire.

## Captures

`plans de travail/captures-2026-10-28-aide-lot-2c/` : `aide-liste-evaluations-1440.png`, `-820.png`, `aide-annoter-evaluer-1440.png`, `-820.png` (mode clair). Aucun défilement latéral à 820 px (mesuré par la spec).

## Le geste à vérifier à l'écran après la mise en ligne

Aide › Évaluation : « La liste des évaluations » est en tête ; chercher « barème » mène à « Annoter et évaluer un travail », au geste des tranches.
