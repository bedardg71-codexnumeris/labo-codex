# Rapport de mesure : les tampons d'observation, avant tout code (24 novembre 2026)

> Claude Code, session du cloud, branche `mesure/tampons-observation` partie de `origin/main` = `2e2ce7828`. Mandat de la session coordonnatrice « Gestion des pratiques de notation 5 » (Cowork), 24 nov., 12 h 45. **Mesure seule : aucun code de l'application modifié**, aucun bump, aucune ligne de Nouvelles, rien fusionné. La règle 15 de `PROTOCOLE.md` est dans un commit à part.
>
> **Le navigateur.** Le cloud a un Chromium (pas de WebKit) : tout ce qui est marqué **VU** a été rejoué dans le vrai `index.html`, espace vide, données fictives (la démo et des noms inventés), par des bancs jetables non commités. Ce qui est marqué **LU** vient du code seul. **Reste à rejouer sur le Mac** : les points 3 et 5 sous Safari (WebKit) et sur l'iPad réel, dont la hauteur utile de Safari en paysage (barre d'outils comprise), que Chromium à 1180 × 820 ne donne pas.

**Ce qui contredit le plan ou ce que Cowork a tranché (cinq lignes) :**
1. **Sur une copie, aucune cible n'est connue.** Un tampon posé ne garde que son `id`, sa position et sa teinte ; aucun écran ne relie une copie à une cible ; « Inscrire pour une production » ne lit ni l'annotation ni l'évaluation (point 4). « Chaque pose est une trace sous une cible » n'a pas de cible pour l'origine « copie » sans un geste neuf.
2. **« Rangée avec ses autres réglages » ne désigne pas un lieu unique** : les réglages d'une catégorie vivent dans cinq clés, sous deux régimes de fusion ; `categoriesPerso` perd toute propriété neuve à chaque enregistrement de la fenêtre (VU). Je recommande une clé propre, au régime « donnée » (point 1).
3. **Le critère déclaré se perd par deux voies ordinaires** : l'import d'un jeu de tampons remplace `personnalisationObservations` en entier (VU) ; la bibliothèque ne le recopie à aucun de ses trois gestes (VU). Le lieu recommandé (point 1) survit à l'enregistrement, pas à ces deux voies sans qu'on les étende.
4. **La copie au geste ne protège pas l'image.** Le plan du 2 nov. n'est pas livré (VU) : un tampon créé puis supprimé n'a plus d'image après rechargement. Un profil qui chercherait l'image d'une trace par son `id` hériterait de ce défaut.
5. **« Observer » n'a pas de place en paysage** : à 1180 × 820, avec quatre critères, la fenêtre dépasse déjà l'écran de 19 px ; toute palette passe sous la bande d'actions collée en bas et demande un défilement (VU). En portrait, 373 px restent libres.

---

## Ce que Cowork a lu, confirmé ou infirmé

**a) `construireInscription` reconstruit l'objet champ par champ : NUANCÉ (confirmé ; un troisième endroit).**
- LU : `js/pratiques/inscriptions-cibles.js:192-216` bâtit un objet aux champs fixes. VU : `construireInscription({…, tampons: [{id: 't'}]})` rend les treize champs d'aujourd'hui, sans `tampons`.
- LU : l'acceptation vit à **deux** endroits, pas un : `motifsRefus` (`inscriptions-cibles.js:254-263`) et, avant lui, `motifsObservation` de l'écran « Observer » (`js/observation-cibles.js:115-119`), qui refuse seul une observation vide avec son propre mot (`MOTIFS.OBSERVATION_VIDE`). VU : une saisie qui ne porterait qu'un tampon est refusée aujourd'hui (« Choisis un niveau, renseigne un critère ou écris une rétroaction… »).
- LU : un banc fige la liste exacte des champs rangés (`tests/unit/sentinelle-par-standards-lot-2-inscrire.test.js:90-91`) ; il rougira dès l'ajout : c'est voulu.
- LU, conséquence d'affichage : une inscription sans niveau est une « remarque » partout (`estSansNiveau`, `compterParCible`, ✎ au tableau, « Remarque, sans niveau » à l'historique, `tableau-cibles.js:628-630`). Une inscription qui ne porterait que des tampons serait comptée et montrée comme une remarque, tant qu'on n'y touche pas.

**b) L'export et l'import d'un jeu de tampons énumèrent leurs champs ; l'import remplace : CONFIRMÉ (lu, puis VU).**
- LU : l'export (`js/travaux-outils.js:3720-3817`) écrit, par tampon, `id, nom, categorie, imageBase64, emoji, retroaction, custom` et, par catégorie, `id, nom, couleur, builtin`. Il saute les tampons masqués et les catégories masquées.
- LU : l'import confirmé (`travaux-outils.js:3891-3989`) récrit `nomsCategoriesTampons`, `couleursCategories`, `categoriesPerso`, `ordreCategories`, `tamponsPersonnalises`, `personnalisationObservations` et `retroactionsObservations` à partir du seul fichier, puis met `categoriesMasquees` et `elementsMasques` à `null`.
- VU (appel direct de l'import, sans la fenêtre) : un champ neuf dans le fichier, sur un tampon ou une catégorie, n'entre pas ; la catégorie à soi du poste disparaît ; la personnalisation d'un intégré absent du fichier (son nom repris et un champ neuf posé à côté) est effacée. Une clé neuve à part n'est pas touchée par l'import, mais les catégories qu'elle nomme peuvent disparaître.

**c) Un tampon posé sur une copie ne garde que l'identifiant du tampon : NUANCÉ.**
- LU : `poserAutocollant` (`js/travaux-annotation.js:1271-1305`, l'objet à 1290-1300) écrit `{ id: 'STK_' + Date.now(), autocollantId, x, y, width, height }` et, si la catégorie a une couleur, `tint`. VU : les champs relus sur la copie sont exactement `id, autocollantId, x, y, width, height, tint`.
- Donc, en plus de l'identifiant du tampon : la teinte de la catégorie au moment de la pose et l'instant de la pose (dans l'`id`, à la milliseconde, déjà relevé au plan du 2 nov., § 5 c). Ni nom, ni catégorie, ni critère, ni cible.

**d) Les noms de catégories dans `nomsCategoriesTampons` ; l'identifiant d'une catégorie fournie ne change pas au renommage : NUANCÉ.**
- LU, confirmé : `nomsCategoriesTampons` (`travaux-outils.js:824-830`) est une table `id → nom` à côté de `couleursCategories` (851-857), `ordreCategories` (965-980) et `categoriesMasquees`. Renommer change la table, pas l'`id` (`action`, `comprehension`, `observations` sont fixes, `CATEGORIES_BUILTIN`, 963 ; une catégorie à soi garde son `cat-<horodatage>`, 3595).
- Nuance 1 : le nom d'une catégorie **à soi** est écrit **deux fois**, dans `nomsCategoriesTampons` et dans `categoriesPerso[].nom` (le même champ porte `data-cat-id` et `data-cat-perso-id`, 3617 ; enregistrés à 3318-3322 et 3348-3353). La rétroaction lit le premier, puis le second (`observationsDesTampons`, 1283).
- Nuance 2 : l'`id` d'une catégorie fournie a déjà changé **une fois, par le code** : la migration d'avril 2026 `contenu → action` (`migrerIdsActionsRLO`, 1006-1119) a dû réécrire chaque clé indexée par catégorie. Toute clé neuve indexée par catégorie serait à inclure dans une migration semblable.
- Nuance 3 : ces clés n'ont pas le même régime à la fusion d'un codex (LU, `js/codex.js:2184-2198`) : `couleursCategories`, `ordreCategories`, `categoriesMasquees` sont des « réglages de l'appareil » (la valeur du poste est gardée) ; `nomsCategoriesTampons` et `categoriesPerso` sont des « données ».

**e) L'état de livraison du plan du 2 nov. sur `main` : ÉTABLI, non livré (aucun des quatre lots).**
- LU : aucune trace de `figeAuVerrouillage` ni de « Retirer de ma palette » dans `js/` ; `enregistrerRetroObservations` reconstruit toujours `retroactionsObservations` à partir des seuls champs affichés (`travaux-outils.js:3260-3264`) et `tamponsPersonnalises` à partir des seules rangées (3384-3408) ; « Réinitialiser » efface toujours tout (3423-3461) ; l'import remplace toujours (b). Historique de `main` (approfondi à 600 commits) : depuis le 2 nov., les fichiers des tampons n'ont reçu que les palettes (2 nov.), l'emoji (#1244, 8 nov.) et des retouches d'Annoter.
- LU : « chaque archive emporte une photo des tampons » (`493e64e24`, 9 nov.) vit sur `lot/production-plutot-que-copie`, **pas sur `main`**.
- VU : le détail est au point 3. Les six faits du tableau du 2 nov. tiennent encore.

---

## 1. Où ranger « catégorie d'observation » et le critère d'un tampon

**Ce qui existe (LU ; VU pour les enregistrements).** Il n'y a pas d'objet « réglages d'une catégorie » ni d'objet « tampon ». Un tampon, c'est : sa définition dans le code (intégré) ou dans `tamponsPersonnalises` (créé) ; son nom repris, son image, son emoji dans `personnalisationObservations[id]` ; son texte dans `retroactionsObservations[id]`. Une catégorie, c'est : son nom dans `nomsCategoriesTampons` (et `categoriesPerso` pour une à soi), sa couleur, son rang, son masque, chacun dans sa clé. Toutes ces clés sont **globales** (communes aux trimestres).

| Lieu possible | Ce qui s'y passe aujourd'hui | Verdict |
|---|---|---|
| Une propriété sur `categoriesPerso[i]` | VU : perdue à chaque « Enregistrer » de la fenêtre (reconstruit `{id, nom}`, 3318-3322). Ne contient pas les catégories fournies | Écarté |
| `nomsCategoriesTampons` | Table `id → texte`, lue par au moins quatre lecteurs ; y mettre un booléen change son type | Écarté |
| `couleursCategories` | Reconstruite du DOM à chaque enregistrement (3356-3360) ; régime « appareil » à la fusion | Écarté |
| **Une clé neuve : la liste des `id` de catégories « d'observation »**, même forme que `categoriesMasquees` | VU : une clé à part n'est touchée ni par l'enregistrement de la fenêtre ni par l'import d'un jeu. Absente = aucune catégorie : « aucune d'office » sans rien écrire chez personne | **Recommandé** |
| Une propriété sur `tamponsPersonnalises[i]` (critère) | VU : perdue à chaque enregistrement (`{id, nom, categorie}`, 3392-3396) ; ne contient pas les intégrés | Écarté |
| **`personnalisationObservations[id]`, un champ de plus (critère)** | VU : survit à l'enregistrement de la fenêtre (l'objet est relu puis complété, 3266-3296) ; couvre les intégrés et les tampons créés ; c'est déjà la source du nom repris (plan du 2 nov., § 2) | **Recommandé** |
| Une clé neuve `id → critère` | Possible, sans doublon ; mais une clé de plus à faire voyager partout où le nom voyage déjà | Second choix |

**Ma recommandation et pourquoi.**
- **« D'observation »** : une clé globale neuve, liste d'`id` de catégories, **au régime « donnée »** à la fusion (ne pas l'ajouter à `REGLAGES_DE_L_APPAREIL`, `codex.js:2184`). Décidé par moi, à corriger : qu'une catégorie laisse ou non une trace sous une cible change ce qui s'écrit dans les inscriptions ; ce n'est pas une préférence d'affichage d'un appareil, comme la couleur ou le masque. Conséquence assumée : elle se fusionne comme les noms (importée si absente ici, conflit de la clé entière si les deux diffèrent).
- **Le critère déclaré** : un champ de plus dans `personnalisationObservations[id]`, en texte, facultatif. Il suit le nom repris partout où celui-ci voyage ; l'enregistrement de la fenêtre le garde déjà.
- **Stock** : ni l'une ni l'autre n'écrit rien chez qui que ce soit ; l'absence vaut « non » et « aucun critère ». Rien à réparer.
- **Ce que l'une et l'autre obligent à toucher** (LU, pour mémoire, pas un plan) : l'export et l'import d'un jeu (b) ; la bibliothèque (point 2) ; « Réinitialiser » (3423) ; `docs/DATA-OWNERSHIP.md` ; `LIBELLES_DES_CLES` (`codex.js:2611`) pour que la fenêtre de fusion nomme la clé neuve ; une catégorie à soi supprimée laisserait son `id` dans la liste (sans effet, à ignorer à la lecture ou à retirer à l'enregistrement).
- **Le champ de l'inscription** : `construireInscription`, `motifsRefus` et `motifsObservation` (a). Deux choses restent à trancher (technique, Cowork) : la catégorie copiée est-elle l'`id`, le nom, ou les deux (le nom lu plus tard suivrait un renommage, le nom copié non) ; l'image n'est pas dans la copie que Cowork a tranchée (point 6).

**Le rapprochement à l'affichage** (LU) : un critère de cible a un `id`, un texte rogné et « essentiel » (`EnsemblesCibles.normaliserCible`, `ensembles-cibles.js:59-71`). L'inscription copie déjà ses critères avec leur texte : rapprocher le critère déclaré du texte **copié dans la même inscription** donne un résultat stable, même si le critère est réécrit plus tard dans l'assistant. Rien n'empêche deux critères d'une même cible, ou de deux cibles, de porter le même texte (aucune garde d'unicité lue).

**Skill `integrite-globaux`** : une seule source (le poste), aucune source neuve dans les globaux, aucun `id` neuf à préfixer, aucun filtre par drapeau ; le point 4 de sa liste (réversibilité) est sans objet puisque rien n'écrit dans le stock.

---

## 2. Le voyage des trois données

Légende : **A** = la liste des catégories « d'observation » (clé neuve recommandée) ; **B** = le critère déclaré (`personnalisationObservations[id]`) ; **C** = le champ `tampons` d'une inscription.

| Canal | A | B | C | Preuve |
|---|---|---|---|---|
| Export / import d'un jeu de tampons | **se perd** (catégories énumérées) ; les `id` qu'elle nomme peuvent devenir orphelins | **se perd** ; **l'import efface** celui du poste | sans objet | b) ; VU |
| Bibliothèque de tampons | sans objet (une entrée ne porte que l'`id` de sa catégorie) | **se perd en trois points** : « Garder » écrit `id, nom, fichier, categorie, imageBase64, custom, metadata_cc` (`tampons-bibliotheque.js:125-137`) ; l'import passe par la liste blanche `SCHEMAS_IMPORT.tampon` (`import-export.js:1408-1430`) ; « Utiliser » écrit `{id, nom, categorie}` (163-167) | sans objet | VU pour les trois |
| Partage `.lcz` | hors canal | hors canal | hors canal : les inscriptions ne voyagent jamais (`ensembles-cibles.js:264`) | LU `partage-schemas.js:62` (grille, échelle, cartouche, production, pratique) ; un champ inconnu ailleurs fait refuser le paquet (`:22`, `:627`) |
| Export / import d'un codex | passe | passe | passe | LU `codex.js:481-487` (toutes les clés), `:907` (écrite telle quelle, aucun schéma) |
| Fusion de deux codex | non déclarée : « donnée », importée si absente ici, conflit de la clé entière sinon (`codex.js:2239`, `:2350`, `:2371`) ; dans `REGLAGES_DE_L_APPAREIL`, elle ne voyagerait jamais par fusion | objet clé → valeur : conflit de la clé entière, comme le nom aujourd'hui | union par `id` ; une entrée jamais réécrite ne crée aucun conflit (`codex.js:2382-2395`) | LU |
| Réserve (archives) | ne part pas | ne part pas | **passe**, entrée copiée entière | LU `reserve.js:58-74` (aucune clé de tampons), `:103` et `:252-258` |
| Correction d'un DA | sans objet | sans objet | passe (clone, seul le DA change) | LU `correction-da.js:36-50`, `:134` |
| Démo | le pack ne pose aucune clé de tampons | idem | passe (`Object.assign`, `demo-namespace.js:160-176`) | LU |

- **Lu, à retenir** : une copie rouverte de la Réserve dessine ses tampons avec les réglages du poste qui l'ouvre ; un tampon absent du poste n'est pas dessiné, sans message (`travaux-annotation.js:1396-1397`).
- **Lu, infirmant le rapport du 2 nov. sur un point** : « la valeur du poste est gardée » pour les masques vaut à la **fusion** ; à l'**ouverture** d'un codex (remplacement), le fichier écrase tout, réglages d'appareil compris (`codex.js:440-446`).
- **Aucun banc n'impose de déclarer une clé globale neuve** (LU, `tests/unit/`). Celui qui impose sept registres à `inscriptionsCibles` existe (`sentinelle-par-standards-lot-2-inscrire.test.js:461-470`).

## 3. Ce qu'un tampon retiré, masqué ou renommé devient aujourd'hui

VU (Chromium, une copie fictive en Annoter, la vraie fenêtre des tampons ; « image » = l'application trouve-t-elle une image à dessiner) :

| Tampon posé | Après le geste | Après rechargement | Rétroaction (bloc lu par l'étudiant·e) |
|---|---|---|---|
| Intégré, renommé, texte à soi, puis **retiré** de la fenêtre (masqué) | image | image | « Observations », son nom repris ; **le texte fourni remplace le sien** |
| Créé, avec image et texte, puis **supprimé** | image (en mémoire) | **aucune image : invisible sur la copie** | « **Autres tampons** », son nom, **texte vide** |
| Créé dans une catégorie à soi, puis **renommé** | image | image | sa catégorie, **le nouveau nom**, son texte |
| Intégré d'une catégorie fournie **masquée** (« Compréhension ») | image | image | « Compréhension », son nom, son texte : masquer une catégorie ne retire rien d'une copie |

Ce qui reste en base d'un tampon créé supprimé (VU) : son nom et son image dans `personnalisationObservations` ; plus sa catégorie ni son texte. Identique au rapport du 2 nov. Une copie verrouillée suit les mêmes réglages (le figé du lot 3 n'existe pas, LU).

## 4. Le chemin d'une copie évaluée vers une inscription sous une cible

- **L'écran** (LU, VU) : Évaluation › Tableau de notation, en vue étendue seulement. Deux gestes : « Inscrire pour une production » (`tableau-cibles.js:897-955`), ou une case dont « D'où vient cette inscription ? » désigne une production (`:535-550`). La vue simple n'a aucun geste par production (`:247-248`). Aucun autre écran n'y mène : `ouvrirParProduction` n'est appelé que du tableau des cibles (`:408-409`).
- **Le moment** : quand l'enseignant·e y va, après coup ; rien ne s'ouvre depuis Annoter ni Évaluer.
- **Ce que l'écran sait** (LU) : les étudiant·es et les productions du groupe, les cibles de la pratique ainsi que `production.ciblesRenseignees` par `ciblesOffertes` (`inscriptions-cibles.js:392-398`) : les cibles déclarées par la production, ou toutes si elle n'en déclare aucune. VU : dans la démo, la production « Stratégies de lecture sur « Deux-Rives » » offre un seul bloc, « La lecture stratégique » (capture `par-production-1180x820-clair.png`).
- **Ce qu'il ne sait pas** (LU) : `tableau-cibles.js` ne nomme ni `annotationsTravaux`, ni `evaluationsSauvegardees`, ni `fichiersTravaux`, ni aucun tampon. Les données pour retrouver la copie existent (`fichiersTravaux` par DA et production, puis l'annotation par `fichierId`, `travaux-stockage.js:943-945`), mais l'écran ne les lit pas.
- **Une production à plusieurs cibles** : l'écran montre un bloc par cible offerte, chacun sur « Rien ce jour-là » ; c'est l'enseignant·e qui choisit. Rien, au moment d'inscrire, ne dit quelle cible un tampon de la copie concerne : le tampon posé n'a ni cible ni critère (c). Avec un critère déclaré, un rapprochement par le nom vers les critères des cibles offertes ne désigne une cible que si ce nom n'existe que dans une seule (aucune garde d'unicité).
- **Une tension à arbitrer** (inférence) : sur une copie, les tampons se posent un à un en Annoter et s'enregistrent d'eux-mêmes (`planifierSauvegarde`) ; il n'y a pas de geste « inscrire ». « Chaque pose est une trace datée » et « l'inscription reçoit une liste de tampons » ne désignent donc pas le même moment pour l'origine « copie ».

## 5. L'écran « Observer » à 820 et 1180 px, clair et sombre

VU (Chromium, démo « Par standards », cible « La lecture stratégique », quatre critères ; captures dans `captures-2026-11-24-tampons-observation/`). Les mesures sont identiques en clair et en sombre.

| | 1180 × 820, 4 critères | 1180 × 820, sans critère | 820 × 1180, 4 critères | 820 × 1180, sans critère |
|---|---|---|---|---|
| Fenêtre | 760 px de large, haut à 32, **bas à 839** (19 px sous l'écran) | bas à 571 | 760 px, bas à 807 | bas à 539 |
| Bas de « Inscrire et passer au suivant » | 793 | 525 | 767 | 499 |
| Libre sous la fenêtre | **aucun** | 249 px | **373 px** | 641 px |
| Largeur utile du formulaire | 704 px | 704 px | 728 px | 728 px |
| Palette de 6 tampons (48 px, écart 8 px) : bas de la fenêtre | 899 : la palette passe sous la bande d'actions | 631 | 867 | 599 |
| Palette de 12 | 899 (une rangée) | 631 | 867 | 599 |
| Palette de 20 | 955 (deux rangées, 104 px) | 687 | 923 | 655 |

- Par rangée de 48 px : 12 tuiles à 1180, 13 à 820 (mesuré par un bloc neutre de carrés posé un instant dans la fenêtre puis retiré, pour la mesure seulement). Six ou douze tiennent sur une rangée ; vingt en demandent deux.
- LU : la bande d'actions est collée en bas (`.oc-actions`, `position: sticky`, `css/tableau-cibles.css:1029-1034`) ; « Inscrire » reste donc visible en paysage, mais ce qui dépasse (la palette, puis le champ « Ce que tu as vu ») passe dessous et demande un défilement pour chaque étudiant·e.
- À côté de chaque critère, entre la fin de son texte et les boutons : 272 à 407 px à 1180, 296 à 431 px à 820, sur des rangées de 61 px (VU, critères courts de la démo ; un critère long en laisse moins).
- Captures : `observer-1-choix-1180x820-sombre.png`, `observer-2-quatre-criteres-{1180x820,820x1180}-{clair,sombre}.png`, `observer-2-sans-critere-1180x820-sombre.png`. Largeur des captures : 1 px CSS pour 1 px d'image, comme les autres captures du dossier.
- **À rejouer sur l'iPad** : la hauteur utile réelle de Safari en paysage (barre d'onglets et d'adresse), plus petite que 820 ; le défilement sous la bande collée au doigt.

## 6. Le profil

- LU : la section « Cibles » (`js/profil-cibles.js:140-152`) montre, par cible, le niveau retenu en clair (`TableauCibles.retenuHTML`, avec son origine et sa rétroaction au profil) puis toutes les inscriptions, en lecture seule (`historiqueHTML`, `tableau-cibles.js:668-675`). Une entrée (`_entreeHTML`, `:643-662`) : la date, le niveau ou « Remarque, sans niveau », l'origine, la note brève, puis la liste des critères, chacun ✓, ✗ ou – suivi de son texte et de « critère essentiel ».
- VU (capture `profil-cibles-1180x820-{clair,sombre}.png`, après une observation fictive faite par « Observer ») : chaque ligne de critère prend toute la largeur de l'entrée (1004 px à 1180) et son texte finit entre 124 et 205 px : **environ 800 px libres à droite de chaque critère**, sur des lignes de 22 px.
- Une trace sans critère déclaré n'a pas de ligne à elle : la place qui existe est celle de l'entrée (entre la note brève et la liste des critères, ou après).
- LU, inférence : la copie tranchée par Cowork (`id`, nom, catégorie, critère) ne contient pas l'image. Pour la montrer, le profil devrait la chercher par l'`id` dans les réglages du poste ; un tampon créé supprimé n'en a plus après rechargement (point 3) ; une archive rouverte ailleurs n'a pas les tampons du poste d'origine (point 2). Ordre de grandeur relevé le 2 nov. pour une image : 490 à 2 650 caractères ; un emoji est une PNG de 128 px.

## 7. La simulation (`lot/pratique-en-simulation` = `28b3d1293`, lue sans y toucher)

- LU : « pratique en simulation » est un champ de plus sur le groupe-cours, `simulationPratiqueId` (branche, `js/simulation-pratique.js:7-9`, `:28`), qui ouvre sous le tableau officiel un second tableau des cibles marqué « Simulation ». La branche n'est pas fusionnée (PR n° 57 en brouillon, rapport de la branche : Chromium non rejoué en entier après correctifs, rien sous WebKit).
- LU : une observation inscrite depuis « Observer » en simulation tombe dans **la clé réelle du trimestre**, `cle('inscriptionsCibles')`, avec l'`ensembleId` de la pratique simulée ; ni `cle()` ni `modifierEtAnnoncer` ne sont détournés (le banc de la branche le vérifie : `tests/integration/pratique-en-simulation.spec.js:253-255`, attend `['ENSC_SIM']`).
- Donc un tampon posé depuis « Observer » en simulation écrirait la même inscription, sous l'ensemble de la pratique simulée. Une inscription ne porte aucun identifiant de pratique : elle est lue par **toute** pratique qui partage cet ensemble (`duneCase`, `inscriptions-cibles.js:285-287` ; `NoteCibles.lireEleve`). La seule garde de la branche refuse une simulation qui partagerait l'ensemble de la pratique officielle du même groupe (`examiner`, état `meme-ensemble`, branche `simulation-pratique.js:99`).
- Inférence (de la lecture de la branche, à faire vérifier par sa conversation) : si la pratique simulée devient l'officielle, ses inscriptions faites en simulation, tampons compris, comptent aussitôt ; rien ne les distingue.
- LU : sur `main`, l'autre sens de « simulation » (le Comparateur, `simulerIndices`) n'écrit jamais dans `inscriptionsCibles` ; en « Mon groupe actif », il lit les vraies inscriptions du trimestre (`comparateur-pratiques.js:108-110`).

## 8. La démo et le parcours « Suivre ton groupe par cibles »

- LU : le parcours 9 touche l'observation par trois bulles. La 3 ouvre « Observer » ; la 4 fait choisir « La lecture stratégique » et tout le groupe, puis date l'écran du 11 septembre 2025 (`ObservationCibles.dater`, `parcours-cibles.js:315-320`) ; la 5 amène Marmotte Pétillante, coche Structure et Rigueur « Respecté », Plausibilité « Non respecté », laisse Nuance vide et écrit une note (`pack-demo-10.js:10249-10258`). La 6 et la 9 relisent la trace (✎, « Remarque, sans niveau », « Observation »).
- LU : l'état de départ de la démo porte 49 inscriptions, toutes avec un niveau et sans texte ; 9 désignent une production, **40 n'en désignent aucune et se lisent donc « Observation »** (`lireOrigine`) sans en être (trouvaille T1). Seule « La lecture stratégique » a des critères (quatre, dont trois essentiels).
- LU : **la démo n'a aucune copie** dans le groupe « Par standards » (ni fichier, ni annotation, ni tampon ; `demo-activation.js:691`). Ses deux productions déclarent `ciblesRenseignees: ["demo-cible-ls"]`. Aucune catégorie de tampons n'y est « d'observation » ; le pack ne pose aucune clé de tampons : la palette de la démo est celle du poste.
- Ce qu'un tampon y changerait (inférence, LU) : une palette dans « Observer » repousserait « Inscrire et passer au suivant », que la bulle 5 désigne et garde (`parcours-cibles.js:563-570`) ; le banc exige la bulle et sa désignation dans l'écran aux deux orientations (`je-regarde-cibles-2026-11-23.spec.js:87-88`) ; le risque est en paysage (point 5). Le banc lit les coches sur **tous** les `.tc-critere` de l'écran (`:185`) : des tampons qui reprendraient ces classes s'y mêleraient. La sentinelle confronte les bulles, mot pour mot, à la consigne validée (`sentinelle-parcours-cibles-2026-11-23.test.js:93-95`) : montrer un tampon dans le parcours demande d'abord des mots neufs. « Refaire » retire tout ce qui est sur la case Marmotte × « La lecture stratégique » (`parcours-cibles.js:713-728`) : un champ neuf n'y change rien ; une trace de tampon datée du 11 septembre 2025 sur cette case serait prise pour l'observation de l'exemple (`inscrite`, `:232-243`).

---

## Trouvailles (issue « inscrire et continuer », sans entrée au BACKLOG)

- **T1** · Démo : 40 inscriptions sans production se lisent « Observation » à l'historique (par `lireOrigine`, depuis le 22 nov.) alors qu'elles posent un niveau et ne viennent d'aucune observation. Le pack les dit « d'aucune production (à corriger si Grégoire les veut rattachées) » (`pack-demo-10.js:10180-10182`). LU.
- **T2** · Fusion d'un codex : choisir « l'autre » sur une clé clé → valeur (`personnalisationObservations`, `nomsCategoriesTampons`) remplace l'objet entier et perd les entrées qui n'existaient qu'ici, alors que la fenêtre dit « Rien n'est effacé » (`codex.js:2461-2463`, `:2812`). Inféré de la lecture, non rejoué.
- **T3** · Import d'un jeu de tampons : il efface les catégories à soi et les personnalisations d'intégrés absentes du fichier (VU). Déjà inscrit au plan du 2 nov., lot 1 (« à mesurer avant de toucher ») : c'est maintenant mesuré.
- **T4** · `importerTampons` remet à zéro `event.target.value` par la variable globale `event` au lieu de la cible reçue (`travaux-outils.js:3885`). LU, sans conséquence observée.
- **T5** · `bibliothequeTampons` est absente de `docs/DATA-OWNERSHIP.md`. LU.

## Les questions qui reviennent à Grégoire (sans réponse ici)

1. **Sur une copie, sous quelle cible se range la trace d'un tampon d'observation** quand la production renseigne plusieurs cibles, ou aucune ? Et à quel moment la trace naît-elle : à la pose sur la copie, ou quand tu inscris pour la production ?
2. **Ce que lit l'étudiant·e** : un tampon d'observation posé sur sa copie entre aujourd'hui, comme tout tampon, dans le bloc « Observations » de sa rétroaction, avec son texte. Doit-il y rester ? Sa trace au profil est-elle aussi quelque chose qu'il ou elle lit ?
3. **Une inscription qui ne porte que des tampons** (ni niveau, ni coche, ni texte) est aujourd'hui une « remarque » (✎, « Remarque, sans niveau »). Est-ce ce qu'elle est pour toi ?
4. **Ce qu'un retrait doit emporter** : retirer un tampon de la palette, le supprimer, ou retirer à sa catégorie la propriété « d'observation » laisse les traces déjà inscrites (elles sont copiées). Le profil doit-il continuer de les montrer telles quelles ?
5. **Les mots affichés** : « observation » a déjà deux sens à l'écran, la catégorie fournie « Observations » et l'origine « Observation » d'une inscription. Le nom de travail en ajoute un troisième ; et le parcours 9, dont les bulles sont validées mot pour mot, devra-t-il montrer le tampon ?
