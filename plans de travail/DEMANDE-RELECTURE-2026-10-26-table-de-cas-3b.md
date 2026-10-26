# Demande de relecture – La table de cas, lot 3b (26 oct. 2026)

> Claude Code, lundi 26 oct. 2026, fin d'après-midi, sur `main` (parti de `a46312ad` ; le lot 3a, `cddfd207`, commité, non poussé). Consigne : `CONSIGNE-LOT-2026-10-26-critere-algorithmique-table-de-cas-3b.md` ; ébauche validée : `EBAUCHE-2026-10-26-table-de-cas.html`. Commits : `c4666c7e` (docs : consigne, verdict 3a, note des portes 3a), le lot, puis le relais. **Ni release, ni verdict, ni push** (consigne § 9) : les lots 3a et 3b partiront ensemble au signal de Grégoire.

## Vue d'ensemble

Sous la table des paliers, l'enseignant·e ajoute ses tables : chacune lit **une** valeur de la copie (le compte, l'étendue, la note du critère, la part de la limite, la moyenne, le code le plus fréquent) et choisit **un** cas ; le texte de ce cas s'ajoute à la phrase du critère, juste après la projection, dans les deux modes, et part avec elle au PDF et à « Copier tout ». Une table neuve et ses cas naissent vides. La donnée (`critere.tablesCas`) n'existe qu'avec une table ; elle voyage à l'export, au codex, à la copie d'une grille, à la bibliothèque, à l'import et au partage. **Un critère sans table lit exactement ce qu'il lisait** (mesuré dans les deux modes).

## Ce qui est mesuré

| Preuve | Résultat |
|---|---|
| Vitest entier, depuis `tests/` | **9 756 verts / 822 fichiers** (avant : 9 724 ; + 30 du banc neuf, + 2 ailleurs) |
| Banc neuf `unit/critere-algorithmique-tables-de-cas-3b.test.js` | 30 cas (A à F) ; **15 break-tests** Vitest et **2 dans WebKit**, faits un à un, restaurés (`sha1` identique), tous rouges (liste en fin de fichier) |
| Spec neuve `integration/critere-algorithmique-tables-de-cas-3b.spec.js` (WebKit) | 7 essais + les captures : ajouter une table, « Selon », un bloc de la palette, ajouter / retirer un cas, la borne refusée, « Voir ce que l'étudiant·e lirait dans ce cas », la simulation ; « Retirer cette table » et sa confirmation ; **une vraie copie évaluée** (mode simple, sept codes posés dans Annoter) : la phrase sous le critère, la mémoire de l'évaluation et le PDF portent le texte des cas atteints ; 1 440 · 1 180 · 820 · 700 px |
| Les specs WebKit touchées (27 fichiers qui lisent l'atelier, la palette, la saisie algorithmique, le partage), sur l'état final | **100 verts**, 6 captures sautées (sur demande), en 6 min. La suite complète du navigateur n'a pas tourné (verdict au signal). |
| Captures | 13 : `plans de travail/captures-2026-10-26-table-de-cas-3b/` — 1 440, 1 180, 820 px × clair, sombre × deux disciplines, une table du compte et une du code ; le PDF de la copie évaluée |
| Le stock (piège 1) | le relevé du lot 3a (`table-de-cas-3a-avant.json`) reste vert à l'octet ; **un critère neuf sans table** (C.a) : la phrase des deux modes est identique, à l'octet, à celle calculée sans le registre des tables, sur sept copies |

## Les points à relire en priorité

1. **Le transport.** Import (`assainirObjet`) : un type de schéma dédié, `tablesCas`, qui délègue à `tablesCasAlgo.assainir` — le type `array` aurait coercé une borne illisible en 0 (un seuil que personne n'a écrit) ; une table illisible est écartée, les textes passent par `assainirChaine`, aucune table lisible : pas de champ. Partage : schéma fermé (`partage-schemas.js`) **et** refus de structure (`tablesCasAlgo.refusStructure`, appelé par `partage-validation.js` comme le barème) — **au partage, une table illisible fait refuser le paquet**, elle n'est pas écartée en silence (écart possible à votre lecture du § 4 : dites-le si vous la voulez écartée). Export, codex, copie de grille : le critère entier est copié (mesuré par lecture : `JSON.stringify`, clés entières, `{ ...c }`). Bibliothèque : par le schéma d'import.
2. **La phrase.** `phraseDecompteAlgo` reçoit un sixième argument, `contexte` (`{ note, code, poses }`) ; sans lui (la réparation du stock), la note se recalcule par la formule. `_avecTablesCas` n'ajoute rien quand il n'y a pas de texte atteint : la phrase d'hier, à l'octet. Mode Catégories : après la projection, avant l'observation du code dominant (`_construireRetroactionAlgoCategories`), avec la note et le code de la saisie.
3. **Le code le plus fréquent de la copie** (mode simple) : `_codeDeLaCopiePourTables` ne lit rien sans une table selon le code ; seulement pour le premier critère algorithmique (#1132) ; l'annotation qu'Annoter a ouverte si c'est celle de l'évaluation (#1142), sinon celle du fichier de l'évaluation (`trouverFichierPourEvaluation`). Les codes posés **dans l'ordre** : `codesAnnotation.posesDeLAnnotation` (neuf). La réparation du stock (`comptes-erreurs-stock.js`) lit de même les poses du premier critère.
4. **La note qu'une table lit** : celle que l'évaluation retient, **bornée** (`pctBorne × pondération / 100`), pas `noteCalculee` (qui descend sous 0 avec une pénalité fixe : « 0 / 20 » ne serait jamais atteint). Cas B.c, C.f.
5. **La moyenne** se calcule du compte et de l'étendue (`Math.round(mots / compte)`) — la même valeur que `{moyenne}` quand la limite conclut (cas B.e) — et **aussi sans limite**, ce que l'ébauche fait (« Sans valeur » : « la copie ne porte aucune occurrence »). La consigne disait « sortent du calcul de projection » : sans limite, la moyenne aurait toujours été « Sans valeur ». La palette montre la même valeur (`valeursDesBlocs`).
6. **Les cliquets.** `assainirObjet` 43 → 44 (le `case` d'une ligne ; `HAUSSES_ASSUMEES` le dit) ; #467 `grilles.js` 80 → 105 (le détail dans le cliquet : `${tid}` ×11, `${geste}` ×10, `${zone}`, `${s}`, `${options}`, `${rangees}`, tous construits par `esc` ou des constantes ; l'identifiant d'une table n'admet que `[A-Za-z0-9_-]`). Cinq fonctions neuves au-dessus de 15 ont été découpées plutôt que de relever le compte (447 tient).

## Le piège 2 — une évaluation déjà enregistrée (lu, pas mesuré au banc)

Rouvrir une copie évaluée non verrouillée relance le calcul par `input` (`poserErreursDuChamp` puis le compteur d'Annoter, `mettreAJourCompteursErreurs`) : **la phrase se recalcule** et porte le texte des tables ajoutées depuis (elle est écrite sous le critère et dans `evaluationEnCours`). Qu'elle **s'enregistre sans geste** dépend des gardes de `_debouncerAutoSave` (suspension pendant le chargement, compteur #960), que le handler arme (`evaluation-handlers.js`). Je ne l'ai pas mesuré dans WebKit ; rien n'est changé à ce comportement dans ce lot (consigne § 6.2). C'est le même chemin que pour une limite ou un palier modifiés après coup.

## Écarts et décisions (dites si vous les défaites)

| | Ce que j'ai fait | Motif |
|---|---|---|
| D1 | **Changer « Selon » d'une table qui porte un texte le demande dans la carte** : « Passer à « La part de la limite » remplace les cas de cette table et efface leurs textes ? » · « Changer » · « Annuler ». Une table vide change sans rien demander. | La consigne ne demandait la confirmation que pour « Retirer cette table » ; changer de valeur efface aussi les textes. Règle du 20 sept. Mots nouveaux (l'enseignant·e les lit, pas l'étudiant·e). |
| D2 | La table du code suit la liste des codes : un code ajouté après coup a sa rangée (vide, écrite au premier texte, à sa place) ; un code retiré de la liste garde la sienne, nommée « Code N ». | Ne rien perdre, ne rien deviner. Cas E.e. |
| D3 | À égalité, un critère existant : `lePlusFrequent` sans liste (le premier à **atteindre** le nombre), comme l'atelier du lot 3a ; l'écran dit « le premier posé ». La ligne « principalement » du bilan, elle, prend le premier **compté** (`codePrincipal`). | Hérité de 3a, signalé : les deux règles diffèrent quand un code posé tôt est rattrapé. Aucun critère existant n'a de table : rien ne change pour personne aujourd'hui. |
| D4 | « Voir ce que l'étudiant·e lirait dans ce cas » sur une copie sans étendue dit « Copie réglée : 1 unité manquante. », pas « … pour 0 calcul » (vu en capture). | La copie n'a pas d'étendue : le champ est vide. |
| D5 | Le menu « Selon » prend l'apparence des menus de la bibliothèque (chevron dessiné, 40 px) ; la règle vaut aussi pour « Reprendre une de tes collections… » (même étiquette), qui mesurait 23 px dans WebKit. | Cible du toucher ; mesuré dans la spec (≥ 40 px). |
| D6 | Mot nouveau : « La borne est un nombre, 0 ou plus. » (le refus d'une borne). | L'ébauche ne disait pas le refus. |
| D7 | Le mode Catégories reçoit les tables (consigne § 3.3) ; le § 8 exclut #1133, que je lis comme l'écran qui active le mode, pas son moteur. | Inférence, à confirmer. |

## Trouvaille inscrite (hors lot)

**#1169** — une grille partagée perd « Ce palier lève un signalement » (`leveSignalement`) **et** le texte du signalement (`paramsProjection.libelleSignalement`) : mesuré sur `construirePackage` → `validerPackage` → `prefixerEntites`, le paquet est déclaré valide et les deux champs disparaissent. Inscrite avec son symptôme au BACKLOG ; non corrigée.

## Ce qui a changé, fichier par fichier

| Fichier | Quoi |
|---|---|
| `js/tables-cas-algo.js` (neuf) | la donnée, sa lecture (`assainir`, `lire`, `refusStructure`), les cas par défaut de l'ébauche, le cas choisi (`casChoisi`), les valeurs d'une copie, le texte ajouté (`appliquer`, `ajouterALaPhrase`), les mots des valeurs et des cas, les gestes (`ajouterTable`, `changerSelon`, `ajouterCas`, `retirerCas`, `ecrireBorne`, `ecrireTexte`, `retirerTable`) |
| `js/grilles.js` | `rendreTablesCasAlgo` (sous la table des paliers, avant « Ce que l'application choisit sans toi »), ses neuf gestes exposés sur `window`, les confirmations en mémoire ; la zone d'un cas dans `_estZoneAlgo` et `insererRepereEnonce` |
| `js/atelier-algo.js` | `TEXTES.tables` (les mots de l'ébauche), la phrase qui revient dans `frequentTexte`, la chaîne et le résumé, la simulation (morceau « Table · … »), `copiePourCas`, `voirCas`, la rangée atteinte |
| `js/evaluation-calcul.js` | `_avecTablesCas`, `_codeDeLaCopiePourTables`, `_annotationDeLaCopie` ; les deux modes |
| `js/miroir-algo.js` | `essayer` rend `tables` et les ajoute à `eleve` |
| `js/palette-algo.js` | une zone de table offre les blocs des paliers et {points} ; la palette porte ces blocs dès qu'une table existe ; le nom d'une zone de table |
| `js/composeur-badges.js` | les zones de table reçoivent la vue à badges |
| `js/codes-annotation.js` | `posesDeLAnnotation` |
| `js/comptes-erreurs-stock.js` | la réparation passe les poses d'une table du code |
| `js/import-export.js`, `js/partage-schemas.js`, `js/partage-validation.js` | le transport (voir le point 1) |
| `styles.css` | `.table-cas--enseignant` (deux colonnes, empilées sous 560 px), `.table-cas-confirmer`, `.table-cas-ajouter-table`, le menu « Selon » |
| `index.html` | le module chargé avant la palette ; les numéros de cache |
| Bancs | le banc neuf, la spec neuve ; cliquets #467 et complexité (motifs écrits) |
