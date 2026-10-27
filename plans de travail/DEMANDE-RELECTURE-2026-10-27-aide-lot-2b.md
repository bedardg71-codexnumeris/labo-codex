# Demande de relecture – L'Aide, lot 2b : la Conception (#1152)

> Claude Code, mardi 27 octobre 2026, sur `main` (base `b8c85062`, le commit de docs du § 0). Consigne : `CONSIGNE-LOT-2026-10-27-aide-lot-2b-conception.md`. Non poussé, pas de release.
> Les preuves dans `js/` et `index.html` hors de l'Aide sont au HEAD (le code n'est pas touché par ce lot).

## En bref

- La Conception passe de **11 entrées à 10** : `idme` est absorbée par `solo`, devenue « SOLO et l'échelle de départ (IDME) ».
- **3 030 mots → 2 698** (mesurés : texte visible des entrées, commentaires retirés ; la consigne estimait ~3 350 → ~2 100). L'écart à la cible vient de trois entrées :
  - `sous-criteres` (793 mots, cible ~550) : les textes validés, gardés mot pour mot, font déjà ~400 mots ; s'y ajoutent les phrases neuves de l'atelier, que la consigne demande ;
  - `apporter-grille` (506, cible ~420) : le paragraphe des points et des niveaux, « Couper » et « Rattacher », gardés comme le dossier le dit, plus le groupe « Les codes » ;
  - `solo` (245, cible ~150) : deux tableaux, le tableau SOLO gardé (#810) et celui de l'échelle de départ avec ses valeurs ponctuelles, que demande la consigne.
- **Aucun fichier `js/` touché** ; `js/config.js` et `js/navigation.js` non plus.
- Tests :
  - Vitest complet : **9 965 sur 9 965** ;
  - sentinelles de l'Aide : 201 sur 201 ;
  - Playwright ciblé : 11 sur 11 (la spec neuve, plus les specs nommées par la consigne et celles de l'Aide).
  - Le verdict complet n'est pas lancé.
- **Un écart à la consigne, tranché par la mesure** : `creer-grilles`. Le dossier et la consigne disent « aucune alerte » sur le total. Le code en a une, à l'enregistrement : « Grille enregistrée : ses critères totalisent N %, pas 100 %. » (`js/grilles.js:832`), qui ne bloque pas. L'entrée dit ce que fait le code.

## Entrée par entrée

| # | Id | Titre | Mots avant → après | Ce qui a changé |
|---|---|---|---|---|
| 1 | `pratique` | Choisir ta pratique de notation | 305 → 231 | « Sur les reprises » retiré. Une phrase par famille, et les « À régler » gardés. Standards : l'échelle à choisir avant de créer la pratique, et la « Construction de la note » avec ses quatre choix, dont « Hybride ». Le geste d'entrée est « + Nouvelle pratique ». Renvoi à « Les chaînes d'étapes ». |
| 2 | `creer-productions` | Créer et configurer les productions | 178 → 101 | « Layout » et « ⚠️ Important » retirés. La rangée (« + Nouvelle production » puis « Créer la production »), les douze types, « Activité d'apprentissage », « Travail diagnostique », « Préparer le PDF », « + Nouveau champ » et « Échéances par groupe ». Renvoi à « La bibliothèque ». |
| 3 | `lecons` | Planifier les leçons | 620 → 191 | Ce que fait la carte, et ses trois gestes de base : « Actions ▾ › Nouvelle carte », la palette « Nœuds », le lien d'un port à l'autre. Le guide est le bouton « Guide », avec « Vue ▾ › Raccourcis clavier ». Les gestes de bibliothèque sont nommés par leurs libellés. « Exporter le plan… » reste. Renvois aux deux entrées de Commencer. La corbeille reste absente (#1070). |
| 4 | `creer-grilles` | Créer une grille de critères | 129 → 174 | Les pratiques compatibles retirées. Le type en une phrase (« analytique », des points que son barème décrit). **D5** : la définition du sous-critère vit ici. Les trois couleurs du total, et l'étape « Pondération » qui prend la même. Le message à l'enregistrement (voir l'écart plus haut). La grille en points ne se mesure pas à 100. Le PDF se prépare depuis la production. |
| 5 | `apporter-grille` | Apporter une grille que tu as déjà | 572 → 506 | La grille en points qui nomme ses niveaux se crée avec un barème, sans échelle. Le groupe « Les codes » et « Ajouter ces codes » sont ajoutés, hors de la liste des six. Le retour à l'étiquetage est décrit sans nommer son bouton. Les étapes 1 et 2 sont resserrées, et la phrase qui doublait la popup est retirée. Les six `li` sont intacts, et la carte reste avant `bareme`. |
| 6 | `bareme` | Le barème d'un critère analytique | 175 → 209 | F2, le tableau, F4 et F5 inchangés. Une phrase neuve sur ce que lit l'étudiant·e, dans les mots de `TEXTES-2026-10-27-bareme-evaluation.md`, plus un renvoi à « Annoter et évaluer un travail ». |
| 7 | `sous-criteres` | Les critères algorithmiques | 537 → 793 | D2, D2d, D7 et D8 sont réécrits ; D0, D2e, D7a et D7b sont ajoutés. D1, D2a à D2c, D3, D4, D4b, D5 et D6 restent mot pour mot, et il y a toujours trois `li`. Les cinq étapes ne sont pas listées : l'entrée renvoie à « Les chaînes d'étapes ». |
| 8 | `creer-echelles` | Créer une échelle de performance | 120 → 113 | Les champs de l'écran, la valeur ponctuelle dite, le palier SOLO facultatif, les deux repères et l'étape « Repères ». L'échelle sert les critères holistiques. « Exemple IDME » et « Layout » retirés. |
| 9 | `solo` (+ `idme`) | SOLO et l'échelle de départ (IDME) | 189 + 101 → 245 | La fusion. SOLO est présenté comme une option, avec sa case, le menu (y compris « Aucun ») et le dépistage, avec et sans l'option. La théorie renvoie au guide (D1). « Pourquoi SOLO plutôt qu'une note sur 100 ? » est retiré. **D2** : le seuil M est dit au conditionnel, et « prédit la réussite » est retiré. Le tableau de l'échelle de départ porte ses valeurs ponctuelles. « Autres échelles possibles » et « adaptable à ton contexte » sont gardés. |
| 10 | `creer-cartouches` | Créer une cartouche de rétroaction | 104 → 135 | « Aperçu aléatoire » et « 50 à 75 mots recommandés » retirés. « Paliers (bornes en %) », « Consignes du travail », les deux contextes, les quatre gestes d'export et d'import, et la copie faite quand on change la grille. Renvoi à « La bibliothèque ». |

**D2 ailleurs** : aucune entrée de la Conception ne dit « organiser, être rigoureux » ni « doivent rester les mêmes ». La seule occurrence est dans le Suivi (`index.html`, `suivi-apprentissage`), qui relève du lot 2c.

## Preuves (fichier:ligne)

### `pratique`

- Assistant ouvert par « + Nouvelle pratique » : `index.html:5521`, `js/pratiques.js:864-870`.
- Les quatre modes de « Construction de la note » : `js/wizard-pratique-v2.js:655-664`.
- L'échelle exigée pour Standards : `js/wizard-pratique-v2.js:2444, 2484`.
- La chaîne qui finit par « Groupe-cours » : `js/pratiques-gestion.js:1100-1108`.

### `creer-productions`

- « + Nouvelle production » : `index.html:4644` ; « Créer la production » : `4682`.
- Douze types : `4736-4756`.
- « Activité d'apprentissage », dite recommandée : `4760`.
- La case diagnostique et son effet : `4810-4815`.
- « Préparer le PDF », au-dessus des trois choix liés : `4826-4855`.
- « + Nouveau champ », qui devient un bloc des consignes : `4886-4889`.
- « Échéances par groupe » : `4912`, visible quand plusieurs groupes partagent le cours (`js/productions.js:936-944`).

### `lecons`

- « Consulter la bibliothèque » et le menu des cartes : `index.html:4287-4288`.
- « Actions ▾ › Nouvelle carte » : `4292-4294` ; le nom est demandé à la création (`js/planification-carte.js:9320`).
- « Exporter le plan… » : `4303`.
- « Raccourcis clavier » : `4386`.
- « Guide » : `4394`.
- « Nœuds » : `4345, 4408`.
- Le lien d'un port à l'autre : `js/planification-carte.js:1935`.
- Fenêtre de la bibliothèque : ⋮ « Dupliquer », « Exporter », « Supprimer définitivement » ; « Importer une carte » (fichier .json) ; « Importer depuis un autre trimestre » (`js/planification-bibliotheque.js:162-254`) ; « Importer ou exporter ▾ » (`js/bibliotheque-ui.js:1936`).

### `creer-grilles`

- « + Nouvelle grille » : `index.html:4979` ; « Créer la grille » : `5008`.
- Les trois types : `js/grilles.js:3582-3584`.
- Sous-critères d'un critère non algorithmique, « + Ajouter un sous-critère » : `js/grilles.js:5135-5150`.
- Couleur du total, en points sans couleur : `js/grilles.js:1282-1305`.
- Étape « Pondération » de la chaîne : `1323-1330`.
- Message à l'enregistrement : `832`.
- Grille en points, toute analytique : `js/gabarits-utils.js:94-95`.

### `apporter-grille`

- Grille en points, niveaux devenus tranches du barème, sans échelle : `js/materiel-assistant.js:23-26, 338-370`.
- Groupe « Les codes » : `js/materiel-dissection-lecture.js:63-66`.
- « Ajouter ces codes » et « Il garde sa formule et sa pondération » : `js/materiel-dissection.js:1049-1053`.
- Bouton de retour, à côté de « Coller une autre grille », seulement si un brouillon existe : `js/materiel.js:110-117`.
- « Créer ma grille » : `js/changelog-data.js:214` ; le libellé est dans le module de la dissection.

### `bareme`

- Ce que lit l'étudiant·e : `js/synthese-retroaction-data.js:598-610`.
- Mots repris de `TEXTES-2026-10-27-bareme-evaluation.md` (en-tête et H3, validés le 27 oct. à 10 h 31).

### `sous-criteres`

- Atelier, simulation : `js/atelier-algo.js:62-72, 173`.
- Les cinq étapes : `js/atelier-algo.js:68-72`.
- Un calcul tout fait a ses réglages, un calcul composé n'en a pas : `js/grilles.js:3727-3745`.
- « Le calcul, en blocs : » : `3755`.
- « Retoucher ce calcul » : `3752`. Il ouvre le composeur sur une copie nommée « Mon calcul, d'après « … » », réglages devenus nombres : `js/evaluation-formules.js:665-676`.
- « Quand une donnée de la copie vaut 0 » : `js/grilles.js:3780`.
- « Composer ton propre calcul » et « Ce calcul sert » : `js/composeur-calcul.js:32, 39-40`.
- Ligne chiffrée à l'évaluation : `js/evaluation-calcul.js:525-540`. Elle est cachée sur une copie verrouillée que le calcul actuel ne redonne plus : `1462-1490`.
- « Cas d'interprétation », « Fixer une limite », « Retirer la limite », longueur de référence et tolérance, seuil en % de la limite : `js/atelier-algo.js:68-72, 102-125`.
- « Retirer la limite » garde ce qui est écrit : `js/grilles.js:4138` et `js/evaluation-projection.js:882-886`.
- Limite indépendante de la note : `js/atelier-algo.js:118`.
- Nom court dans la rangée des paliers du PDF : `js/atelier-algo.js:107-109`.
- Tables de cas : « + Ajouter une table de cas » `js/atelier-algo.js:242` ; les valeurs `js/tables-cas-algo.js:61-83` ; « Une table neuve naît vide » `js/atelier-algo.js:225`.
- **D8, la règle mesurée (consigne : « mesure d'abord »)** :
  - Une copie verrouillée garde sa note remise, en base comme à l'écran ; une ligne dit la note du calcul actuel quand elle diffère : `js/evaluation-calcul.js:1408-1455, 1504-1514` (#1173). Un trimestre fermé (A2025, H2026) n'a pas cette ligne, et l'Aide n'en parle pas.
  - Le déverrouillage fait passer l'écran au calcul actuel, sans rien écrire : `js/evaluation.js:2150-2174`, `js/evaluation-calcul.js:1526-1536`.
  - La copie s'enregistre au premier geste (vérifié au lot de la note remise, `DEMANDE-RELECTURE-2026-10-27-note-remise.md`, § 2 et essais).
  - Depuis le lot C, « déjà évaluée » veut dire « verrouillée » : enregistrer, c'est verrouiller.
  - La phrase de l'étape (`js/grilles.js:3685`) et le code disent **la même règle** : aucune divergence. L'Aide reprend la phrase de l'écran mot pour mot, et la sentinelle neuve compare les deux.

### `creer-echelles`

- « + Nouvelle échelle » : `index.html:5174` ; « Créer l'échelle » : `5203`.
- Les champs : `js/echelles.js:1847, 1857, 1866, 1877, 1886, 1898`.
- « Palier SOLO du niveau » selon l'observation SOLO : `1760-1765`.
- La valeur ponctuelle (bulle) : `js/accompagnement-contenu-hover.js:299-300`.
- Les deux repères : `js/echelles.js:2656-2658` ; l'étape « Repères » : `2379`.
- Ce que sert l'échelle : le tableau de `bareme` (validé).

### `solo`

- La case « Activer l'observation de la structure des résultats d'apprentissage » : `index.html:8695-8696`, dans Labo › Outils d'observation.
- Le menu « Complexité SOLO du critère », avec « Aucun », rendu seulement si la case est cochée : `js/grilles.js:3313-3356`.
- Ce que surveille le dépistage : `js/profil-etudiant-helpers.js:950-964`.
- « Ouvrir le guide SOLO » : `js/accompagnement-contenu-popup.js:1211-1230` (aide « i » `grille-niveau-solo` du menu).
- « Échelle de départ (IDME) », ses bornes, ses paliers SOLO et ses valeurs ponctuelles : `js/echelles.js:79-119, 376`.
- « Maîtrisé à partir de » : `js/echelles.js:2658` ; ce que lit l'application : `js/profil-etudiant-calculs.js:303-310`.

### `creer-cartouches`

- « + Nouvelle cartouche » : `index.html:5301` ; « Créer la cartouche » : `5330`.
- Exports et modèle : `5350-5356`.
- « Consignes du travail » : `5415` ; les deux contextes : `5451, 5459` ; l'import texte : `5469`.
- « Paliers (bornes en %) » : `js/cartouches.js:3278, 3320`.
- La copie après une question, l'originale intacte : `js/cartouches.js:3459-3466`. Elle est refusée si des commentaires se mêleraient (`3531-3533`), ce que l'Aide ne dit pas.

## Les ids

- `idme` : aucun lecteur dans `js/` (`grep`). Les occurrences de `'idme'` dans `js/init-inline.js:568` (les synonymes de la recherche) et dans `js/accompagnement-contenu-terme.js:346` (le terme du lexique) ne sont pas l'id de l'entrée.
- Dans `tests/`, le seul lecteur est la liste `PLACES` de `sentinelle-aide-2026-10-24-forme.test.js`, recalée.
- Les autres ids ne changent pas.

## Tests

### Neufs

**`tests/unit/sentinelle-aide-2026-10-27-lot-2b.test.js`** (8 essais), qui calcule les deux côtés :

- la Conception a les entrées du § 2, dans l'ordre, et `idme` n'existe nulle part ;
- aucun mot de l'ancien écran ni de jargon (sidebar, barre latérale, Layout, dropdown, Workflow, Aperçu aléatoire) ;
- chaque libellé entre « » des entrées 2, 4, 8 et 10 se trouve dans `index.html` hors de l'Aide (texte rendu) ou dans `js/`. Les renvois aux titres d'entrées de l'Aide, lus dans la page, sont écartés ;
- le tableau de l'échelle de départ égale l'échelle semée, lue dans `js/echelles.js` ;
- D8 contient la phrase de l'étape « Note calculée », lue dans `js/grilles.js` ;
- les gestes de l'atelier cités dans `sous-criteres` existent dans le code ;
- D5 et la règle des couleurs, comme le code ;
- le retour à l'étiquetage et « Ajouter ces codes ».

**Break-test : 13 ablations, 13 rouges**, arbre restauré par sha256 :

- `idme` réintroduite ;
- une entrée renommée ;
- « Layout » ;
- « Aperçu aléatoire » ;
- un libellé inventé ;
- un libellé paraphrasé ;
- une valeur ponctuelle fausse, dans l'Aide puis dans le code ;
- D8 différent de l'écran, puis la phrase de l'écran changée ;
- un geste de l'atelier renommé ;
- D5 retirée ;
- le retour à l'étiquetage retiré.

**`tests/integration/aide-lot-2b-1152.spec.js`** : la recherche trouve « Cas d'interprétation » et « Composer ton propre calcul » (seulement `sous-criteres` dans la Conception). « IDME » mène à `solo`, la seule entrée de la Conception, et à aucune `idme`. `CAPTURES_AIDE_2B=<dossier>` produit les captures.

### Modifiés, par décision

Chacun cite l'audit, la remesure et la consigne.

- **`critere-algorithmique-mots.test.js`** :
  - D2, D2d, D7 et D8 sont recalés ;
  - D0, D2e, D7a et D7b sont ajoutés ;
  - le fichier réglé `TEXTES-2026-10-27-aide-critere-algorithmique.md` est lu par T.0 ;
  - l'exception de D2 en T.0 est retirée (D2 est maintenant dans un fichier) ;
  - les trois `li` sont toujours exigés.
- **`sentinelle-aide-2026-10-24-forme.test.js`** : `idme` part de `PLACES`, avec le compte « 61 − 4 + 2 − 1 ». L'invariant des 75 entrées de l'audit est gardé.
- **`sentinelle-audit-aide-15-oct-ce-que-fait-l-application.test.js`** : « Exemple IDME » part de `creer-echelles` (consigne, entrée 8). La borne lue dans `js/echelles.js` se vérifie maintenant dans le tableau de `solo`.
- **`sentinelle-detachement-clone.test.js`** (tombé au Vitest complet) : il exigeait un paragraphe « Décloner un bloc » dans l'Aide, qui nomme l'Inspecteur et Actions. `lecons` le perd par décision : l'audit (`lecons`) dit que copier et cloner redisent le panneau des raccourcis et l'infobulle `planif-detacher-clone`, et la consigne fixe ~200 mots (entrée 3). L'aide longue qui reste est l'aide « i » de la carte (`js/accompagnement-contenu-popup.js:947`). Elle nomme les deux chemins, et le banc la vérifie maintenant. Break-test : « Actions ▸ Décloner la sélection » retiré de la popup donne un rouge, arbre restauré par sha256. **À trancher par Cowork** si ce recalage ne lui convient pas.
- Ces trois bancs, plus la sentinelle neuve, rougissent contre l'ancien `index.html` : **12 rouges**, arbre restauré par sha256.
- **Un rouge de ma main, corrigé** : mon commentaire dans `bareme` citait le nom de fichier de la synthèse de la rétroaction. Deux bancs (`sentinelle-581-enonces-sans-discipline`, `sentinelle-codes-par-grille-lot1`) repèrent ce nom dans `index.html` pour vérifier l'ordre des scripts. J'ai reformulé le commentaire, sans changer de texte affiché.
- Aucune autre assertion n'est tombée. `sentinelle-aide-apporter-mon-materiel`, `bareme-2-pieces-d-aide`, `sentinelle-1002-mots-clos` et `sentinelle-audit-aide-lot-E` n'ont pas été modifiés.

### Résultats

- Vitest complet : **9 965 sur 9 965** (833 fichiers ; 9 957 au départ, plus les 8 neufs).
- Playwright ciblé (WebKit) : **11 sur 11**, soit `aide-lot-2b-1152`, `critere-algorithmique-mots`, `bareme-2-aide`, `materiel-aide-accompagnement`, `aide-forme-1152`, `aide-lot-2a-1152` et `aide-exporter-archiver-893`.

## Pour Grégoire

Décision de Cowork du 27 oct., 15 h 40 : seules montent les phrases qui disent quelque chose de l'application au-delà d'un libellé d'écran. S'y ajoutent **toutes** les phrases réécrites ou ajoutées de `sous-criteres`.

### `sous-criteres` (fichier `TEXTES-2026-10-27-aide-critere-algorithmique.md`)

- **D0** (neuf) : « Le critère s'ouvre en atelier, une étape à la fois, à côté de la « Simulation de ce que l'étudiant·e lirait ». Ses étapes : voir « Les chaînes d'étapes ». »
- **D2** (réécrit) : « Un critère algorithmique calcule sa note à partir de ce que tu comptes sur la copie. Tu choisis le calcul dans l'étape « Note calculée » du critère. Un calcul tout fait a un réglage ; un calcul que tu composes n'en a pas : ses nombres sont dans ses blocs. »
- **D2e** (neuf) : « « Retoucher ce calcul » ouvre « Composer ton propre calcul » sur une copie du calcul choisi ; l'original ne change pas. « Ce calcul sert » dit si ton calcul donne la note ou sert seulement à tes phrases et à tes tables. « Quand une donnée de la copie vaut 0 » dit ce que vaut alors la note. »
- **D2d** (réécrit) : « « Le calcul, en blocs » montre le calcul choisi, tes réglages compris. Au moment d'évaluer, il s'affiche en chiffres sous le résultat ; sur une copie verrouillée que le calcul actuel ne redonne plus, cette ligne se cache. »
- **D7a** (neuf) : « L'étape « Cas d'interprétation » situe la copie par des paliers, d'après une limite : une longueur de référence et une tolérance sur cette longueur. « Fixer une limite » en pose une ; « Retirer la limite » la retire sans effacer ce qui est écrit. Chaque palier a un seuil, en pourcentage de la limite, un nom court et ce que l'étudiant·e lit. La limite ne touche pas la note. »
- **D7b** (neuf) : « « + Ajouter une table de cas » choisit un texte selon une valeur de la copie : un compte, la note, la part de la limite, la moyenne, le code le plus fréquent ou l'un de tes calculs. Une table neuve est vide. »
- **D7** (réécrit) : « L'étudiant·e lit, sous le critère, la phrase du décompte, puis le cas de sa copie dans les paliers, puis le texte des tables de cas. Son PDF imprime aussi le nom court de son palier et la ligne du calcul : « 7 erreurs (5 après pondération) sur 400 mots → 13,75/20 (68,8 %) ». La parenthèse ne paraît que si le nombre pondéré diffère du nombre posé. »
- **D8** (réécrit ; la deuxième et la troisième phrase sont celles de l'écran, mot pour mot) : « **Règle les pondérations avant de corriger.** Une copie déjà évaluée garde sa note. Elle ne suit le nouveau calcul que si tu la déverrouilles et la modifies. Verrouillée, si le calcul actuel lui donnerait une autre note, une ligne sous sa note le dit. »
  - Retiré de l'ancien D8 : « la pondération s'applique alors à toute la copie ». C'est toujours vrai, mais la phrase de l'écran suffit.

### Les autres entrées

- **`creer-grilles`**, la définition D5 : « Sous un critère holistique ou analytique, « + Ajouter un sous-critère » en ajoute un : un élément observable du critère, ce que tu regardes dans toutes les copies pour en juger. Dans un critère algorithmique, un sous-critère devient une catégorie de ce que tu comptes (voir « Les critères algorithmiques »). »
- **`creer-grilles`**, le message : « À l'enregistrement, un message rappelle un total qui n'est pas à 100 %, sans bloquer. »
- **`creer-productions`**, la case diagnostique : « Cochée, la case « Travail diagnostique — ne compte dans aucun calcul » garde le travail entier au dossier de l'étudiant·e, hors de la note et des indices. »
- **`bareme`** : « L'étudiant·e lit le chiffre, puis le texte de la tranche atteinte, sans son nom ; quand aucune tranche ne couvre les points, le chiffre seul. »
- **`apporter-grille`**, la grille en points : « Une grille en points qui nomme ses niveaux se crée avec un barème : chaque niveau devient une tranche, sans échelle. »
- **`apporter-grille`**, les codes : « Une liste de codes d'annotation se colle seule, et s'étiquette avec le groupe « Les codes » de la palette. « Ajouter ces codes » les verse dans un critère algorithmique qui n'en a pas encore ; il garde sa formule et sa pondération. »
- **`apporter-grille`**, le retour : « Une fois ta grille créée, un bouton à côté de « Coller une autre grille » te ramène à ton étiquetage, tel que tu l'as laissé. »
- **`creer-echelles`** : « Une échelle de performance sert les critères holistiques : tu choisis un niveau, l'échelle en donne la note. » et « La valeur ponctuelle est ce que vaut le niveau quand il faut un chiffre. »
- **`solo`**, l'option : « SOLO est une option : la case « Activer l'observation de la structure des résultats d'apprentissage », dans Labo › Outils d'observation. Cochée, chaque critère offre le menu « Complexité SOLO du critère », avec « Aucun », et le dépistage surveille les critères multistructurels ; décochée, le menu disparaît et le dépistage surveille tous les critères. »
- **`solo`**, D2 : « Dans cet exemple, la maîtrise commencerait à M, le niveau relationnel, soit 75 %. Ce n'est pas une règle de l'application : elle lit où commence la maîtrise dans le repère « Maîtrisé à partir de » de ton échelle. »
  - Une réserve : les bornes du niveau RàI (64 % et 75 %) restent fixes, comme le note D3, déjà à #551. La phrase ne parle que du repère de l'échelle et ne prétend pas que l'application n'a aucun seuil.
- **`solo`**, l'encadré : « L'échelle de départ se modifie ou se remplace. Toute échelle de Conception → Échelles de performance sert de la même façon. »
  - Cet encadré remplace « L'échelle IDME est utilisée en pratique PAN – Standards… », qui présentait l'exemple comme la règle d'une famille.
- **`creer-cartouches`** : « Changer la grille d'une cartouche enregistrée en fait une copie pour la nouvelle grille, après une question ; l'originale reste telle quelle. »

## Trouvé en chemin

- **Inscrit au tableau « Trouvé hors de la section Aide »** (issue 2, lot 5) : le bouton « Revenir à ma dissection » (`js/materiel.js:115`), texte marqué PROVISOIRE, alors que l'onglet ne dit plus « dissection ». Trouver un autre mot revient à Grégoire.
- **Issue 3, sans conséquence observable, non inscrit** :
  - `sous-criteres`, D3, gardé mot pour mot, ne dit pas qu'un critère neuf évalué sans noms se lit « éléments relevés » et « éléments examinés » (`js/evaluation-enonces.js:228-229`). C'est vrai à l'écran, que l'Aide le dise ou non.
  - Le refus de copier une cartouche dont des commentaires se mêleraient n'est pas dit dans `creer-cartouches` ; l'écran l'explique quand il arrive.
- **Vu, non inscrit** (aucun symptôme vécu) : dans `sous-criteres`, les guillemets français de l'entrée gardent des espaces ordinaires, comme les textes validés ; à 1 440 px, un « « » finit seul une ligne (capture `aide-sous-criteres-1440.png`, « « Retirer la limite » »). C'est le même constat qu'au verdict du lot 2a.

## Captures

Dans `plans de travail/captures-2026-10-27-aide-lot-2b/` :

- `aide-sous-criteres-1440.png`
- `aide-sous-criteres-820.png`
- `aide-solo-1440.png`
- `aide-solo-820.png`

## Le geste à vérifier à l'écran après la mise en ligne

1. Ouvrir Aide › Conception.
2. Lire « Les critères algorithmiques » : l'entrée dit l'atelier d'aujourd'hui.
3. Chercher « IDME » : dans la Conception, la recherche mène à une seule entrée, « SOLO et l'échelle de départ (IDME) ».

Six entrées hors de la Conception parlent encore d'IDME (`presentation`, `guide-profil`, `rai-solo`, `partage`, `glossaire-statique`, `faq`) ; elles relèvent des lots 2c, 2d et 3.
