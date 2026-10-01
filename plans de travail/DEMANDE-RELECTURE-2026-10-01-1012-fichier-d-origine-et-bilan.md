# Demande de relecture – #1012 : un fichier d'origine tenu à bon droit, et un bilan qui reste

> Écrite le 1er octobre 2026 à 13 h 32 (Toronto, mesurée par `date`), par Claude Code, pour Cowork. Exécute `plans de travail/CONSIGNE-DU-JOUR.md` (12 h 41 ; ses ajouts de 12 h 49 et de 13 h 02 ne changent pas ce lot). Branche locale `fix-1012-fichier-d-origine-et-bilan`, **commit à relire : `39241b59`**. **Ni release ni push.** Ce chemin écrit les données de l'usager : relecture croisée avant toute release (règle 2).
> Chaque constat dit s'il est **mesuré** (par exécution), **lu** au code, ou **inféré**. Je ne suis pas un pair développeur : ce qui suit est une mesure et une lecture, à relire comme telles.

## Pour Grégoire, en trois lignes

1. **Codé** : l'application ne tient le fichier d'un codex qu'après l'avoir ouvert en entier ; et le bilan d'une ouverture incomplète est dans la fenêtre de rechargement, avec tes mots de 12 h 40.
2. **La mesure** : depuis un espace où des copies manquent, « Mettre à jour le codex » écrit un fichier sans elles et l'écran dit « Codex mis à jour », rien de plus. Un seul signal tient dans tous les cas : compter, à la génération, les copies attendues qui n'ont pas de fichier.
3. **Les mots qui t'attendent** : ceux de l'avertissement (§ 5.3), ceux des trois autres causes d'une ouverture incomplète (§ 4.3), et une trouvaille à trancher (§ 6.1 : « Exporter une sélection » écrit dans le fichier du codex).

## 1 · La porte

Fait, sur `main` (`9b341cf8`, non poussé) : #1011 cochée au BACKLOG ; son retour passé aux corrigés de `SUIVI-BUGS.md` ; § 6 ajouté à `PORTES-TERRAIN-2026-09-30-lot-I-bis.md` (onze rangées sur onze) ; les deux remarques de Grégoire et le constat de Cowork inscrits sous #1012.

## 2 · Étape 1 : le défaut, reproduit avant de corriger

**Mesuré** sur le code de `main`, par `tests/integration/codex-1012-fichier-d-origine.spec.js` (WebKit). Le banc ne lit pas un drapeau : il clique « Mettre à jour le codex » dans le menu et regarde **dans quel fichier** le codex est écrit, et avec quelles données. Départ de chaque rangée : le codex A ouvert en entier par le menu, donc tenu.

| Ensuite | Ce que fait « Mettre à jour le codex », avant le correctif |
|---|---|
| B choisi par le menu, refusé à la garde de modèle antérieur | écrit **les données de A dans le fichier B**, sous-texte « Dans le même fichier » |
| Un fichier qui n'est pas un codex, choisi par le menu | écrit A **dans ce fichier-là** |
| B choisi par le menu, refusé au pré-vol | écrit A dans B |
| B choisi par le menu, une écriture refusée en cours d'ouverture | écrit dans B un espace à moitié remplacé |
| B choisi par la case, refusé à la garde | demande où écrire : A est oublié (sans danger, contraire à la règle) |
| B ouvert, incomplet | demande où écrire (déjà juste depuis 1.173.2) |
| B ouvert en entier | écrit B dans B (juste) |

Quatre rangées sur sept écrivaient dans le mauvais fichier.

## 3 · Étape 1 : le correctif

`js/codex.js`, trois endroits :

- **`chargerCodex`** oublie le fichier tenu juste avant sa première écriture. Tout ce qui précède (fichier refusé, pré-vol, garde de modèle antérieur) le laisse intact.
- **`_ouvrirLeFichierChoisi`** reçoit la poignée du fichier choisi et ne l'adopte qu'après une ouverture complète.
- **`actionOuvrir`** et **`ouvrirFichier`** ne touchent plus à la poignée.

Après le correctif, les sept rangées suivent la règle de la consigne : A gardé dans les quatre refus d'avant toute écriture ; aucun fichier tenu après l'échec en cours d'écriture et après l'ouverture incomplète ; B adopté après l'ouverture complète.

**Ce que j'ai supposé** : (1) « un refus d'avant toute écriture » comprend aussi un fichier qui n'est pas un codex, que la consigne ne nommait pas ; (2) après une ouverture complète par la case, l'application ne tient aucun fichier, puisqu'un champ de fichier ne rend pas de poignée (les données sont celles de B : garder A serait le défaut).

**Ce qui reste inféré pour Chrome** : WebKit n'a ni `showOpenFilePicker` ni `showSaveFilePicker`. Le banc pose une fausse poignée qui consigne ce qu'on lui écrit, et une fausse fenêtre de destination. Non exécuté : que Chrome rende une vraie poignée ; qu'il demande la permission d'écrire, en nommant le fichier, à la première réécriture d'un fichier venu du sélecteur d'ouverture (ce qui, avant le correctif, aurait montré le nom de B) ; que sa fenêtre de destination s'ouvre.

## 4 · Étape 2 : le bilan dans la fenêtre

**4.1 – Ce qui est posé.** `construireBilanImport` rend le titre et le message de la fenêtre. Quand **toutes** les copies manquantes ont été refusées faute d'espace : les mots de Grégoire, tels quels, en trois paragraphes, boutons inchangés. Accord tranché : « 1 copie sur 3 n'a pas pu revenir », et « Pour retrouver cette copie ». **Mesuré** à l'écran (captures WebKit à 1280 × 800 et à 820 × 1180) : le texte tient dans la fenêtre, les deux boutons sont visibles sans défilement.

**4.2 – Le bandeau jaune : retiré.** La fenêtre porte tout le bilan et reste. Le bandeau aurait dit le même fait derrière elle, avec un autre vocabulaire (« fichiers », « ZIP », « Import incomplet »), avant de s'en aller.

**4.3 – Les autres causes : rien de neuf posé, proposition ci-dessous.** Pour une copie absente du fichier, un format non reconnu, une erreur technique, et pour tout mélange, la fenêtre garde son titre « Recharger la page » et porte **les phrases de #334, inchangées** (« Import incomplet : N fichiers sur M… »), puis la question. Le bilan ne dépend donc plus du bandeau dans aucun cas ; aucun mot neuf n'est écrit pour ces cas. Limite assumée : un mélange qui comprend un manque d'espace dit encore « Libère de l'espace puis rouvre le même ZIP ».

Proposition, sur le modèle accepté. Titre commun : « Codex ouvert, mais incomplet ». Deuxième phrase commune : « Tes données, elles, sont complètes, et ton fichier de codex n'a pas changé. »

| Cause | Première phrase | Puis |
|---|---|---|
| Copies absentes du fichier | « {N} copies sur {M} ne sont pas dans ce fichier de codex. » | « Elles manquaient déjà quand ce codex a été écrit : le rouvrir ne les ramènera pas. Cherche-les dans un codex plus ancien ou dans une archive. » |
| Format non reconnu | « {N} copies sur {M} n'ont pas été reprises : leur contenu n'est ni une image ni un PDF. » | « Rouvrir le même codex ne les ramènera pas. » |
| Erreur technique | « {N} copies sur {M} n'ont pas pu revenir, à cause d'une erreur. » | « Pour retrouver ces copies : rouvre le même codex. Si ça se répète, utilise « Signaler un bug » : le détail y sera. » |
| Mélange | « {N} copies sur {M} n'ont pas pu revenir : {a} faute d'espace, {b} absentes du fichier, {c} dans un format non reconnu, {d} à cause d'une erreur. » | Le « Puis » de chaque cause présente, celui de l'espace en premier. |

## 5 · Étape 3 : mettre à jour depuis un espace où des copies manquent (mesure seulement)

**5.1 – Ce qui arrive aujourd'hui.** **Mesuré** par une sonde jetable (WebKit, jeu fictif de deux trimestres et trois copies, non commitée), dans deux variantes : le marquage « manquant » a pu s'écrire ; il a été refusé (espace plein).

| Chemin | Où le fichier est écrit | Ce qu'il porte | Ce que dit l'écran |
|---|---|---|---|
| « Mettre à jour le codex », après un rechargement | la destination choisie (demandée une fois) | 0 copie sur 3 ; son manifeste dit 0 | « Codex mis à jour – fichier choisi » |
| La même, une seconde fois | le même fichier, sans rien demander | 0 copie | « Codex mis à jour – même fichier » |
| « Exporter une sélection », le codex étant tenu | **le fichier du codex**, sans rien demander | un seul trimestre, 0 copie | non relevé dans cette passe |
| Rouvrir ensuite le codex regénéré | – | – | « Import incomplet : 3 fichiers sur 3… 3 absents du ZIP » |

**Lu, non exécuté** : « Enregistrer sous… », le partage de l'iPad et le téléchargement écrivent le même fichier généré ; seule la destination change. Rien n'empêche de choisir le fichier d'origine dans la fenêtre de destination. **Mesuré** : avant la mise à jour, l'état du codex ne porte aucune modification en attente ; tant qu'on ne change rien, rien ne pousse à l'écrire.

**5.2 – Comment l'application peut le savoir.** Mêmes deux variantes, avant et après un rechargement :

| Signal | Marquage écrit | Marquage refusé | Lecture |
|---|---|---|---|
| Statuts « manquant » dans la liste | 3 sur 3 | **0 sur 3** (les copies se disent présentes) | ne suffit pas seul |
| Copies attendues sans fichier, comptées à la génération | 3 sur 3 | 3 sur 3 | **tient dans les deux cas** ; la génération lit déjà chaque copie |
| Le manifeste du codex ouvert annonce 3 copies, la génération en trouve 0 | écart visible | écart visible | ne vaut qu'une fois (après une mise à jour, le manifeste dit 0), et une baisse peut être légitime |
| Un souvenir de l'ouverture incomplète | aucun | aucun | rien n'est stocké aujourd'hui |

« Attendue » : une copie dont le statut n'est pas « exporte » (celle-là a quitté l'application, c'est voulu).

**Pas établi** : combien de copies attendues sont sans fichier, aujourd'hui, dans l'espace de travail de Grégoire. Si ce compte n'est pas zéro, l'avertissement s'afficherait à chaque mise à jour. À relever en lecture seule (IndexedDB en `readonly`, aucun DA sorti) à l'ouverture du lot de l'avertissement, avec son accord.

**5.3 – Proposition** (rien n'est codé). Avertir, sans refuser : un refus bloquerait pour toujours quelqu'un dont des copies sont vraiment perdues. Et, tant que des copies manquent, ne jamais réécrire en place : la destination est toujours demandée.

- Titre : « Ce codex n'aura pas toutes tes copies »
- Texte : « {N} copies sur {M} ne sont pas dans l'application. Le codex que tu t'apprêtes à écrire ne les contiendra pas. »
- Puis : « Si un autre fichier de codex les contient encore, ne le remplace pas : enregistre celui-ci sous un autre nom. »
- Boutons : « Annuler » et « Continuer ».

## 6 · Trouvailles en chemin, et leur issue

**6.1 – « Exporter une sélection » écrit dans le fichier du codex. Issue 2, inscrite sous #1012.** **Mesuré** à la sonde, sans rapport avec les copies manquantes : quand l'application tient le fichier du codex, l'export d'une sélection y écrit un codex « (sélection) » d'un seul trimestre, sans demander de destination. Et dans l'autre sens : sans fichier tenu, l'export demande une destination, puis l'application **tient ce fichier de sélection** ; « Mettre à jour le codex » y écrit ensuite le codex entier, « Dans le même fichier ». **Lu** : `actionExporterSelection` appelle `sauvegarderVersDestination` sans forcer la fenêtre, et celle-ci adopte toute destination choisie. Non vécu. Même famille que ce lot (un fichier tenu sans bon droit), autre porte : je ne l'ai pas corrigé, la consigne ne le couvrait pas. Les données restent dans l'application ; c'est le fichier qui est faux jusqu'à la mise à jour suivante. **Cowork : dis si cela entre dans le lot de l'avertissement.**

**6.2 – Une ouverture dont la persistance n'est pas confirmée adopte quand même le fichier. Issue 3.** **Lu** : l'étape 5 bis de `chargerCodex` peut avertir que le stockage n'a pas confirmé l'écriture ; l'ouverture reste « complète » pour la règle. Aucun banc ne sait produire ce cas ; non touché.

**6.3 – Reste de #1011, non touché** : le chemin frère de `js/import-export.js` (réécriture de la liste des copies sans garde, à l'ouverture d'un ancien fichier). La consigne de ce lot ne le portait pas.

## 7 · La preuve

**Les essais.**

| Banc | Ce qu'il tient |
|---|---|
| `tests/integration/codex-1012-fichier-d-origine.spec.js` (neuf, 5 essais) | (1) quatre refus d'avant toute écriture, l'un après l'autre : la mise à jour écrit toujours A dans A ; (2) échec après les premières écritures : elle demande où écrire ; (3) ouverture incomplète alors que A était tenu : elle demande où écrire ; (4) témoin : ouverture complète de B, elle écrit B dans B ; (5) témoin : ouverture complète par la case, elle demande où écrire |
| `tests/integration/codex-1011-ouvert-sans-espace.spec.js` (mis à jour) | le bilan se lit dans la fenêtre : son titre, son message entier ; aucun bandeau |
| `tests/unit/codex.test.js` (3 essais mis à jour, 3 neufs) | les mots de Grégoire en entier, au pluriel (67 sur 397) et au singulier ; un mélange garde les phrases de #334 |
| Sentinelles #334 B et pré-vol (mises à jour) | le cas incomplet passe par la fenêtre, plus par `notifications.warning` ; la découpe passe par `tranche()`, le cliquet #858 descend d'une unité |

**Les mutations**, une à la fois, restauration par copie, empreinte identique après chacune ; contrôle final vert.

| État muté | Rouges |
|---|---|
| M1 – `chargerCodex` n'oublie plus le fichier d'avant | #1012 (2), (3), (5) |
| M2 – la poignée est rangée dès le choix du fichier (le code d'avant) | #1012 (1) |
| M3 – le fichier choisi n'est jamais adopté | les cinq de #1012, et le témoin (4) de #1011 |
| M4 – il est adopté même après une ouverture incomplète | #1012 (3), #1011 (2) |
| M5 – la case fait oublier le fichier d'avant dès le choix | #1012 (1), au pas de la case |
| M6 – l'oubli vient avant le pré-vol et la garde | #1012 (1) |
| M7 – le bandeau revient, avec le texte du bilan | #1011 (1), (2), (3) ; sentinelle #334 B |
| M7 bis – le bandeau revient, avec un autre texte | #1011 (1), (2), (3), sur « plus de bandeau » |
| M8 – la fenêtre garde le titre « Recharger la page » | #1011 (1), (2), (3) ; sentinelle #334 B |
| M9 – l'accord au singulier est retiré | Vitest, l'essai du singulier |
| M10 – les mots de Grégoire servent aussi aux mélanges | Vitest, les deux essais de mélange |
| M11 – la fenêtre ne porte que la question | #1011 (1), (2), (3) ; les deux sentinelles |

Douze états mutés, douze rouges, chacun sur les essais attendus. Sous M2 et M5, un pas qui suit le pas fautif rougit aussi : l'essai (1) enchaîne ses refus, et un fichier mal tenu le reste.

**Sur `39241b59`** : Vitest complet, 669 fichiers, 7 887 essais verts. Playwright sans reprise : les deux bancs ci-dessus (11 essais) et quatre specs voisines (`lot-i-bis-la-case-ouvre-un-codex`, `lot-i-bis-anciens-fichiers-s-ouvrent`, `codex-temoin-dit-vrai-lot-f`, `import-cartouche-renommee-654` : 13 essais), tous verts. `index.html` : le jeton anti-cache de `js/codex.js`.

## 8 · Source et stock

Source seulement, et rien à réparer : la poignée d'un fichier ne vit qu'en mémoire, elle disparaît à chaque rechargement. Aucune donnée d'usager n'est écrite ni lue autrement qu'avant.

## 9 · Ce qui n'est pas fait

- La suite Playwright complète (elle se prend au verdict, avant un push).
- Chrome réel : voir § 3.
- L'avertissement à la mise à jour : mesuré et proposé, non codé (consigne).
- Les mots des autres causes : proposés, non posés (consigne).
