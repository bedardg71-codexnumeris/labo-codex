# Rapport : « Tampons d'observation », lot 1 — régler (24 novembre 2026)

> Claude Code, sur le Mac, branche `lot/tampons-observation-1-regler` partie de `main` = `65bb52857` (après fusion de
> `mesure/tampons-observation`, en avance rapide, poussée). Consigne : Cowork, « Gestion des pratiques de notation 5 »,
> 24 nov., 13 h 55. **Rien n'est en ligne** : aucun bump, aucune ligne de Nouvelles, aucune fusion du code dans `main`.
> **Aperçu** : https://deploy-preview-58--codexnumeris-051225.netlify.app (demande n° 58, en brouillon, « APERÇU, ne pas fusionner » ;
> vérifié : `js/travaux-outils.js` y est identique à celui de la branche, jetons `20261123t`, version 1.258.1 inchangée).
> Sur GitHub, Vitest est vert sur cette demande ; Playwright n'y a pas été joué (une demande de fusion ne le déclenche pas).

**Fait.** Dans la fenêtre des tampons, chaque catégorie peut être dite « d'observation » et chacun de ses tampons peut déclarer un critère ; le jeu de tampons, la bibliothèque et le codex emportent les deux. Vert sous WebKit et Chromium (17 essais sur 17 chacun), Vitest complet vert (12 356), 21 break-tests rouges sur 21.
**Ce qui contredit la consigne** (détail au § 2) : 1. « une pratique par cibles existe dans le codex » est mesuré dans le **trimestre actif** seulement, et j'ai codé sans m'arrêter pour le demander ; 2. un critère ne voyage que s'il est **montré** (sa catégorie est d'observation) ; 3. la bibliothèque a **cinq** sorties, pas trois, et les cinq emportent le critère ; 4. « au pixel près » tient sous WebKit ; sous Chromium, une bande de 2 px de bulles animées diffère aussi entre deux passes de `main`.
**⮕ RETOUCHE DU 24 NOV., 15 h 35 (section suivante) : le critère voyage toujours (le point 2 ci-dessous est corrigé), les mots sont acceptés, deux titres changent ; lot toujours sur sa branche, non fusionné, rien en ligne.**
**Ce qui reste** : les mots (page `TEXTES-2026-11-24-tampons-observation-lot-1.md`, quatre questions) ; un essai au doigt sur l'iPad (la case, la liste de suggestions du champ), qu'aucun banc ne joue.

---

## Retouche du 24 nov. 2026, 15 h 35 (consigne de Cowork, après l'essai de Grégoire sur son iPad, 15 h 13 à 15 h 30)

**DERNIER RELAIS.** Branche `lot/tampons-observation-1-regler`, **non fusionnée dans `main`** : un push sur `main` est publié d'office par Netlify (`DEPLOY.md`, § 2), et la consigne demande de ne rien mettre en ligne avant les retours des testeurs du 25 nov. Aucun bump, aucune ligne de Nouvelles. Le verdict complet n'a pas été pris : il suit la règle 7 (un seul, le soir).

**Fait.**
1. **Le critère voyage toujours.** `critereDuTampon` ne regarde plus la catégorie ; l'import d'un jeu non plus. Le critère part dans l'export d'un jeu et dans les cinq gestes de la bibliothèque, que sa catégorie soit cochée ou non, et entre de même ; il reste non montré tant qu'elle ne l'est pas. Ceci corrige le point 2 de « Ce qui contredit la consigne », ci-dessus.
2. **Les mots** sont acceptés (Grégoire, 15 h 31) ; la seconde phrase de l'aide C2 est retirée. La page de textes le dit en tête.
3. **Deux titres** (Grégoire, 15 h 33) : la fenêtre s'intitule « Tampons et rétroactions », un jeu exporté « Tampons ». La catégorie fournie « Observations » et les noms des tampons ne sont pas touchés.
4. **Deux trouvailles vécues par Grégoire** inscrites au BACKLOG, sans correction : #1307 et #1308.

**Les occurrences des deux titres** (tout le dépôt, toutes graphies : apostrophe droite ou courbe, échappements `\u`, tirets).

| Chaîne | Où | Nature | Geste |
|---|---|---|---|
| « Rétroactions — Observations » | `js/travaux-outils.js` (le `<h2>` de la fenêtre) | **écran** : la seule occurrence affichée | remplacée |
| | `js/parcours-recevoir.js` (trois commentaires) | commentaire ; aucune bulle de parcours ne cite ce titre | remplacée |
| | `tests/integration/emojis-et-syntheses-papier.spec.js` (un commentaire) | commentaire ; aucun banc n'asserte ce titre | remplacée |
| | `plans de travail/` (cinq consignes et rapports du 8 au 19 nov., la page d'observation aveugle) | traces datées | laissées |
| « Tampons d'observation » (titre d'un jeu) | `js/travaux-outils.js`, deux fois dans `exporterTampons` (titre demandé, titre écrit au fichier) | **écran et fichier** | remplacées |
| | `plans de travail/EXPORT-TAMPONS-GREGOIRE-2026-11-01-22h21.json` | un fichier exporté le 1er nov. : c'est le cas « fichier d'hier » | laissé |
| | `docs/securite/audits/TESTS-DEFENSE-A-2026-05-08.md` (une ligne de tableau) | audit daté | laissé |
| | les autres occurrences (commentaires « Tampons d'observation, lot 1 », noms de fichiers, titres de bancs) | le nom du lot, pas le titre | laissées |

Aucune occurrence dans l'aide, dans les textes des parcours, dans `docs/modules/` ni dans une sentinelle de textes.

**La preuve.**

| Suite | Moteur | Résultat |
|---|---|---|
| `tests/integration/tampons-observation-lot-1-regler.spec.js` (17 essais du lot, 6 de la retouche) | WebKit (Playwright 2287) | **23 sur 23** |
| Le même | Chromium (1223, config jetable, non commitée) | **23 sur 23** |
| `tests/unit/sentinelle-tampons-observation-lot-1-regler.test.js` | Vitest | **26 sur 26** |
| Vitest complet | | **12 360 sur 12 360** (959 fichiers) |
| Les cinq bancs voisins du module (barre d'outils, bibliothèque #1158, emojis, lot F, tampons masqués #1216) | WebKit | 36 verts, 2 exclus, **1 instable** (`tampons-masques-bibliotheque-1216.spec.js:211`, la trouvaille T1, verte au second essai) |

**Un rouge du lot, trouvé et fini ici.** `bibliotheque-deux-colonnes-1158.spec.js:409` rougissait depuis `e1c8ac569` (rejoué sur ce commit : rouge) : son sélecteur `.travaux-retro-cat-aide` attendait une seule aide dans le bloc des catégories, et l'aide C2 du lot porte la même classe. Le premier passage n'avait pas joué les bancs voisins. Le sélecteur de cet essai écarte maintenant l'aide du lot ; l'écran n'a pas changé.

**Break-tests des sentinelles neuves : 8 mutations, 8 rouges** ; chaque fichier remis après sa mutation, arbre propre vérifié.

| N° | Mutation | Rouge |
|---|---|---|
| R1 | `critereDuTampon` exige de nouveau une catégorie d'observation | Vitest B (4 essais) ; WebKit : « cocher, écrire, décocher, exporter… », « la bibliothèque, catégorie non cochée… » |
| R2 | l'import d'un jeu n'accepte le critère que d'une catégorie d'observation | WebKit : « cocher, écrire, décocher, exporter… » |
| R3 | le titre de la fenêtre revient à l'ancien | Vitest G ; WebKit : « la fenêtre s'intitule… » |
| R4 | le titre écrit au fichier exporté revient à l'ancien | Vitest G ; WebKit : « un jeu exporté s'intitule… » |
| R5 | la seconde phrase de C2 revient | Vitest G |
| R6 | l'aperçu d'import réécrit l'ancien titre d'un fichier reçu | WebKit : « un fichier exporté hier… » |
| R7 | la bibliothèque n'emporte plus le critère | WebKit : « la bibliothèque, catégorie non cochée… » |
| R8 | le titre demandé à l'export revient à l'ancien | Vitest G ; WebKit : « un jeu exporté s'intitule… » |

**La comparaison au pixel, refaite en excluant le titre** (WebKit, `main` = `5a2bc31be` contre le lot, même espace portant une liste et un critère, sans pratique par cibles ; 1180 × 820 et 820 × 1180, clair et sombre, en haut et défilée). Elle ne tient plus pour le titre : il change pour tout le monde, c'est voulu.
- Hors du rectangle du titre et hors d'une lisière de 12 px : **8 captures sur 8 identiques**. Le titre garde la même hauteur (31,19 px) : rien ne bouge dessous.
- Jusqu'au bord : 4 sur 8 identiques ; les 4 autres diffèrent de 1, 3, 4 et 50 pixels, tous dans cette lisière (coins arrondis, bord haut). Inférence, non mesurée cette fois : le fond animé derrière les coins. Le premier passage avait mesuré la même chose sous Chromium entre deux passes de `main`.

**Source ou stock.** Le critère : rien à réparer, aucun fichier n'a pu perdre un critère en dehors de l'aperçu (rien n'était en ligne). Les titres : la source change ; un fichier déjà exporté garde l'ancien titre et s'affiche tel quel (essai « un fichier exporté hier… »). C'est assumé, et demandé par la consigne.

**Ce que je n'ai pas refait.** Les douze captures de `captures-2026-11-24-tampons-observation-lot-1/` datent d'avant la retouche : elles montrent l'ancien titre, et celles « avec pratique par cibles » la phrase retirée de C2.

---

## 1. Les deux données : nom, forme, qui les lit, qui les écrit

### A. `categoriesObservation`

- **Nom et régime** : clé **globale** (commune aux trimestres, comme `categoriesMasquees`), écrite sans préfixe.
- **Forme exacte** : une liste d'identifiants de catégories, dans l'ordre des rangées de la fenêtre. Exemple : `["action", "cat-1795546841261"]`. Vidée, elle est rangée à `null`. **Absente, elle vaut « aucune »** ; elle n'est jamais écrite chez qui n'a rien réglé.
- **À la lecture** : un identifiant qui ne désigne plus une catégorie du poste (fournie, ou à soi) est ignoré, sans rien réécrire ; une valeur qui n'est pas une liste vaut « aucune ».
- **À la fusion de deux codex** : une donnée. Absente ici, elle vient ; différente des deux côtés, c'est un conflit de la clé entière. Elle n'est pas dans `REGLAGES_DE_L_APPAREIL`.

### B. `personnalisationObservations[id].critere`

- **Forme exacte** : un champ de texte de plus dans l'objet déjà rangé pour ce tampon, fourni ou créé. Exemple : `{ "custom-17…": { "nom": "…", "imageBase64": "…", "critere": "Dégage le sens de la consigne" } }`. Espaces resserrés, rogné, **200 caractères au plus**. Vide : le champ n'existe pas.
- Une catégorie qui cesse d'être d'observation : le critère n'est plus montré ni emporté, il reste rangé. Recochée, il revient.

### Tout ce qui les lit et les écrit (LU, numéros de ligne au commit du lot)

| Fichier | Fonction | A (la liste) | B (le critère) |
|---|---|---|---|
| `js/travaux-outils.js` | `obtenirCategoriesObservation` (1019) | lit | |
| | `sauvegarderCategoriesObservation` (1030) | **seule écriture** | |
| | `critereDuTampon` (1038) | lit | lit |
| | `declarerCritereTampon` (1046) | | écrit |
| | `ouvrirEditionRetroObservations` (3065-3157) | lit, pour les cases | lit, pour les champs |
| | `enregistrerRetroObservations` (3450-3460, 3500-3510) | écrit | écrit |
| | `reinitialiserRetroObservations` (3618) | vide | efface (avec toute la clé, comme avant) |
| | `exporterTampons` (3946, 3968-3976) | lit | lit |
| | `importerTampons` (aperçu de l'import) | compte, dans le fichier | |
| | `confirmerImportTampons` (4106-4146) | remplace | remplace |
| `js/tampons-bibliotheque.js` | `_avecCritere` (120), appelée par « Garder » un tampon, « Garder » une catégorie, exporter un tampon, exporter une catégorie | | lit, par `travauxOutils.critereDuTampon` |
| | `ajouterDepuisBibliotheque`, « Utiliser » (189) | | écrit, par `travauxOutils.declarerCritereTampon` |
| `js/import-export.js` | `SCHEMAS_IMPORT.tampon` | | laisse entrer `critere` (texte, 200) |
| `js/codex.js` | `LIBELLES_DES_CLES` | la nomme, en mots | (déjà nommée) |

- **Aucun autre fichier ne les nomme** : « Observer », le profil, l'inscription et la copie ne lisent rien. Un essai Vitest le verrouille (bloc F).
- **Aucune fonction de lecture sans appelant** : `critereDuTampon` et `declarerCritereTampon` sont exposées parce que la bibliothèque les appelle ; `obtenirCategoriesObservation` reste interne.
- **Registres** : `docs/DATA-OWNERSHIP.md` (une ligne) ; `LIBELLES_DES_CLES` ; le schéma d'import. Je n'ai trouvé aucun autre registre à tenir pour une clé globale des tampons : `CLES_GLOBALES` et `CLES_NAMESPACEES` (`trimestres.js`) ne listent aucune clé de tampons (elles sont globales faute de préfixe), `db._SSOT_OWNERS` non plus, et la Réserve n'emporte aucune clé de tampons (rapport de mesure, § 2).

## 2. Ce que j'ai tranché, et ce que j'ai supposé

| N° | Décision | Ce que j'ai supposé |
|---|---|---|
| 1 | **Où le réglage se montre** : quand un ensemble de cibles, avec au moins une cible, existe dans le **trimestre actif** (`EnsemblesCibles.lireTous()`). ⚠ La consigne disait « dans le codex » et demandait de le dire avant de coder si ce n'était pas simple : je l'ai tranché et codé. | Qu'une personne qui règle ses tampons d'observation est dans un trimestre où sa pratique par cibles existe. Dans un trimestre sans cibles, les deux réglages ne sont pas montrés ; ils restent rangés, et « Enregistrer » ne les touche pas (essai). Balayer tous les trimestres demanderait de lire toutes les clés `*_ensemblesCibles` : faisable, plus lourd, à ta demande |
| 2 | **Le critère qui voyage est celui qui est montré** : celui d'un tampon dont la catégorie est d'observation. L'import d'un jeu n'accepte un critère que pour une catégorie que le fichier dit d'observation. | Qu'on ne veut pas partager un texte qu'on ne voit plus à l'écran. Conséquence assumée : exporter son jeu puis le réimporter **sur le même poste** efface les critères non montrés (l'import remplace, comme pour le reste) |
| 3 | **La bibliothèque** : cinq gestes construisent une entrée à partir d'un tampon (« Garder » un tampon, « Garder » une catégorie, exporter un tampon, exporter une catégorie, et l'import) ; les cinq emportent le critère, par une seule fonction. « Utiliser » le range. | Que « les trois gestes » de la consigne visaient à ne perdre le critère nulle part. La propriété de la catégorie ne passe pas par la bibliothèque : une entrée ne porte que l'identifiant de sa catégorie (rapport de mesure, § 2) |
| 4 | **Suggestions** : oui, c'était peu coûteux. Le champ du critère propose les textes des critères des cibles du trimestre actif (liste du navigateur, `datalist`) ; on peut écrire autre chose. | Rien n'est rapproché d'un identifiant de critère dans ce lot : c'est du texte |
| 5 | **Longueur** : 200 caractères. | Qu'un critère tient en une ligne ; un critère de cible n'a pas de borne aujourd'hui |
| 6 | **Une catégorie fournie « supprimée » dans la fenêtre** (donc masquée) sort de la liste à l'enregistrement, comme une catégorie à soi supprimée. Une catégorie déjà masquée à l'ouverture garde ce qu'elle était. | Même règle que #1216 : l'enregistrement ne réécrit que ce que la fenêtre a montré |
| 7 | **Symboles** (crochet, croix, point d'interrogation) : pas de champ de critère. | Ils n'appartiennent à aucune des catégories que la fenêtre montre |
| 8 | **Jetons anti-cache** d'`index.html` : cinq fichiers passent à `?v=20261123t` (la sentinelle exige le jour du build courant, 23 nov.). | Ce n'est pas un bump : `version.json` n'est pas touché |

**Tarir n'est pas réparer** : source seulement. Aucun stock n'existe (les deux données sont neuves), rien n'est écrit chez qui que ce soit au chargement, aucune migration.

**Stock que le lot laisse, et que j'assume** : le critère d'un tampon créé puis supprimé reste dans `personnalisationObservations`, comme son nom et son image aujourd'hui (plan du 2 nov., non touché).

## 3. La preuve

### Ce que j'ai VU (le vrai `index.html`, données fictives)

| Passe | Navigateur | Résultat |
|---|---|---|
| `tests/integration/tampons-observation-lot-1-regler.spec.js` | WebKit (Playwright 2287) | **17 sur 17** |
| Le même | Chromium (Playwright 1223, config jetable, non commitée) | **17 sur 17** |
| `tests/unit/sentinelle-tampons-observation-lot-1-regler.test.js` | Vitest | **22 sur 22** |
| Toute la suite Vitest | | **12 356 sur 12 356** (959 fichiers) |
| Bancs existants de la fenêtre des tampons (#1216, emojis, rétroaction #760) avec celui du lot | WebKit | 34 verts, 1 instable (trouvaille T1 : il rougit aussi sur `main`) |

Chaque sentinelle de persistance recharge **trois fois** et lit **IndexedDB** en plus de ce que l'application lit.

| Sentinelle attendue par la consigne | Essai | Break-test (mutation du code → rouge) |
|---|---|---|
| Enregistrer sans rien changer ne perd ni la propriété ni le critère | « tiennent trois chargements, puis un enregistrement sans rien changer » | P3 (cases non lues), P4 (critère non rangé) |
| Un jeu exporté puis réimporté dans un espace vide rend les deux | « un jeu exporté puis réimporté… » (second contexte de navigateur, vide) | P9, P10 (export), P11 (import) |
| « Garder » puis « Utiliser » rend le critère | « la bibliothèque : « Garder » puis « Utiliser »… » (second contexte, par l'import et sa liste blanche) | P13, P14, P15 |
| Sans pratique par cibles, la fenêtre est identique | « rien de neuf ne s'y montre… », et la comparaison au pixel ci-dessous | P1 |
| Aucune clé écrite chez qui n'a rien réglé | « personne n'a rien réglé… » (clé absente d'IndexedDB et de localStorage, trois chargements) | P2 |
| (en plus) Décochée : non montré, non effacé | « une catégorie décochée… » | P5 |
| (en plus) Catégorie masquée, « Réinitialiser », échappement, liste blanche de l'import, suggestions | cinq essais | P6, P7, P8, P12, P16 |
| (Vitest) Borne, catégorie requise, identifiant inconnu, régime de fusion, schéma | blocs A, B, C, E | V1 à V5 |

**21 mutations, 21 rouges** ; chaque fichier est remis à l'identique après sa mutation (arbre propre vérifié).

**« Identique au pixel près », sans pratique par cibles** (VU) : la fenêtre capturée sur `main` (`65bb52857`) et sur le lot, même espace (qui porte pourtant une liste et un critère rangés), à 1180 × 820 et 820 × 1180, en clair et en sombre, en haut et défilée.
- **WebKit : 8 captures sur 8 identiques** dans le rectangle de la fenêtre.
- **Chromium : identiques**, hors une bande de 2 px au bord droit où passent les bulles animées de l'en-tête ; cette bande diffère aussi entre deux passes de `main` (mesuré).
- Hors de la fenêtre, les captures diffèrent toujours : ce sont ces mêmes bulles.

**Ce dont le lot dépend dans le rapport de mesure, rejoué sous WebKit** (ce rapport n'avait vu que Chromium) :
- (b) l'import d'un jeu remplace : confirmé (essai « l'import remplace »).
- (d) renommer une catégorie ne change pas son identifiant : confirmé pour une catégorie à soi (elle reste cochée sous son nouveau nom).
- Point 1 : `personnalisationObservations[id]` survit à l'enregistrement de la fenêtre : confirmé (c'est la sentinelle 1).
- Point 2 : la bibliothèque perdait le critère à ses trois gestes : c'est ce que P13, P14 et P15 remontrent, un geste à la fois.
- (a) `construireInscription` : je n'en dépends pas dans ce lot ; non rejoué.

**Les captures** (WebKit, 1 px d'image pour 1 px CSS), dans `plans de travail/captures-2026-11-24-tampons-observation-lot-1/` :
- sans pratique par cibles : `fenetre-sans-pratique-par-cibles-haut-{1180x820,820x1180}-{clair,sombre}.png` ;
- avec : `fenetre-avec-pratique-par-cibles-haut-…` (les cases des catégories et l'aide) et `…-categorie-…` (la section d'une catégorie d'observation : la phrase du 22 nov., le champ du critère).
- Mesuré sur la capture à 1180 px : la case fait 44 px de haut (cible tactile) ; aucun débordement horizontal de la fenêtre.

### Ce que j'ai LU seulement

- **Le codex emporte les deux données** : vérifié par un essai Vitest sur le vrai module et un vrai ZIP (bloc D), **pas au navigateur**. La fusion : par `_analyserFusion` (bloc E), pas par la fenêtre de fusion.
- Le libellé de fusion (F1 de la page de textes) : lu dans le code, jamais vu à l'écran.
- Le contraste du libellé et de l'aide : ce sont les variables déjà employées par la fenêtre (`--texte-principal`, `--texte-secondaire`) ; je n'ai pas mesuré le rapport.

### Ce qu'aucun banc ne joue

- L'iPad et Safari réels : la case au doigt, la liste de suggestions du champ (`datalist`) et le clavier qui monte. Une machine ne répond pas à ça ; je ne l'ai pas mis en porte terrain, c'est un aperçu à essayer. À Cowork de dire s'il en faut une.
- Le lecteur d'écran lui-même : l'annonce est écrite dans une zone `aria-live`, son texte est vérifié, pas sa lecture.

## 4. Sécurité

- Le critère, le nom d'une catégorie, les suggestions et l'annonce passent par `echapperHtml` ou par `textContent` (essai « aucune balise n'entre », break-tests P8 et P16).
- Aucun gestionnaire inline : la case est suivie par un écouteur délégué posé sur la fenêtre (essai).
- L'import d'un jeu garde ses champs énumérés, étendus à `observation` (sur une catégorie, le booléen `true` seulement) et `critere` (texte, borné), et à eux seuls (essai « la liste blanche de l'import », P12). La bibliothèque : `SCHEMAS_IMPORT.tampon` gagne `critere`, un seul champ (Vitest, bloc C).
- Aucun `console.log`. Le cliquet des interpolations non échappées (#467) reste à 76 pour `travaux-outils.js`.
- Aucun nom réel : tout est fictif, et aucun nom de tampon, de catégorie ou de critère n'est en dur dans le code neuf (Vitest, bloc F ; les bancs lisent les catégories fournies de la fenêtre).

## 5. Trouvailles (trois issues ; aucune entrée au BACKLOG)

| N° | Trouvaille | Issue |
|---|---|---|
| T1 | L'essai « un tampon de catégorie masquée ou inconnue ne sort pas à l'enregistrement » (`tampons-masques-bibliotheque-1216.spec.js:211`) est instable : rejoué 4 fois de suite, il rougit 4 fois sur le lot et 3 fois sur `main`. Le jeton du Mac le compte déjà parmi ses instables. VU. | **Inscrire et continuer** : antérieur au lot, hors de son périmètre |
| T2 | L'export d'un jeu s'intitule « Tampons d'observation » pour tous les tampons (`exporterTampons`, métadonnées CC). Un quatrième sens du mot sur le même écran. LU. | **Inscrire et continuer** : ce sont des mots, portés à Grégoire par la question Q4 de la page de textes |
| T3 | `assainirObjet` ne refuse pas un objet reçu pour un champ de type texte : le champ reste présent. VU en Vitest. Sans conséquence ici : le critère est rogné de nouveau avant d'être rangé. | **Commenter et oublier** : l'essai du bloc C le dit |
| T4 | Les trouvailles T2 à T5 du rapport de mesure tiennent toujours (je n'y ai pas touché). | Déjà inscrites |

## 6. Ce qui remonte à Grégoire, par Cowork

Les mots de `plans de travail/TEXTES-2026-11-24-tampons-observation-lot-1.md`, et rien d'autre : quinze textes, quatre questions.

## 7. Essayer l'aperçu

Sur un groupe d'essai, jamais sur les groupes réels : l'aperçu est un espace vide, à son adresse propre. Charger la démo, ouvrir un groupe « Par standards » (une pratique par cibles y existe), puis Annotation › Tampons. Dans un groupe sans pratique par cibles, la fenêtre doit être celle d'aujourd'hui.

## Journal des break-tests (24 nov. 2026, WebKit pour P, Vitest pour V)

P1 fenêtre toujours offerte · P2 liste écrite même vide · P3 cases cochées non lues · P4 critère jamais rangé · P5 critère non montré effacé · P6 catégorie masquée oubliée · P7 « Réinitialiser » garde la liste · P8 critère non échappé · P9 export sans critère · P10 export sans propriété · P11 import sans la liste · P12 import d'un critère hors catégorie d'observation · P13 « Garder » sans critère · P14 « Utiliser » sans critère · P15 schéma sans `critere` · P16 suggestions non échappées · V1 critère non borné · V2 critère rendu quelle que soit la catégorie · V3 catégorie inconnue non ignorée · V4 clé ajoutée aux réglages de l'appareil · V5 schéma sans `critere`. **Tous rouges.** Joués avant la dernière retouche (la constante de longueur passée par `echapperHtml`, pour le cliquet #467) ; les deux navigateurs et Vitest ont été rejoués après elle.
