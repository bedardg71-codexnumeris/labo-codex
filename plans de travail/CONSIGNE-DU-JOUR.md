# Consigne du jour — la forme de l'écran de réglage du dépistage (maquette validée)

> **Écrite le 11 septembre 2026 à 10 h 10 (Toronto, `TZ=America/Toronto date`) par Cowork, sur la
> maquette que Grégoire a validée à 10 h 05** (« c'est très bien »). Application au moment de
> l'écriture : **`1.129.2`**, build `0911-0717`, `main` = `origin/main` = `137e1b33`.
> Elle remplace la consigne de l'échelle de départ (livrée en `1.129.2`), archivée à côté sous
> `_ancienne-CONSIGNE-DU-JOUR-2026-09-11-echelle-de-depart.md`.
>
> **Remesure avant d'exécuter** : `git --no-optional-locks log --oneline -5`, `cat version.json`,
> `TZ=America/Toronto date`. ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.**
>
> **La spécification, et elle fait autorité** : `plans de travail/MAQUETTE-2026-09-11-outils-observation.html`
> — ouvre-la depuis le dépôt (elle lit `../styles.css`) et lis son code : ce sont des classes de
> l'application. Le cadrage : `plans de travail/CADRAGE-2026-09-10-ecran-de-reglage-du-depistage.md`,
> § « CE QUE LE CHANTIER DEVRAIT PRODUIRE » (la décision, ses mots) et § 4 (la carte des effets, source
> des étiquettes « où ça agit »). Skill **`design-interface`**, § 2 « Processus obligatoire » : il
> s'applique, `design-system.html` est la source de vérité.

---

## AVANT TOUT — un commit documentaire séparé

Modifiés, non commis, de Cowork : `BACKLOG.md` (item `#825`, le chargement lent — inscrit, à régler plus
tard aujourd'hui), le cadrage 10 (§ décision de forme), la maquette (nouveau fichier), et l'archivage de
l'ancienne consigne. **Commets-les d'abord, seuls, `git add` ciblé**, avec la présente consigne.
⚠ L'arbre porte aussi un `D` sur `Retours des testeurs/grégoire/BUG_…_2026-09-09_21-03-59_journal-de-bord-sans-fond.png`
— ce n'est pas de Cowork ; **ne le commets pas dans ce lot**, signale-le dans ton rapport.

---

## POURQUOI

Temps 4 du tri de `Labo › Outils d'observation` (après la carte des effets, les réglages morts et les
mots). Grégoire trouvait l'écran « cacophonique » ; il a arrêté la forme sur maquette. **Le contenu ne
change pas** — mêmes 18 réglages, mêmes textes (ceux de `1.129.2`), mêmes clés, mêmes handlers. Seule la
disposition change, et la façon de saisir trois seuils.

---

## CE QUE LA MAQUETTE ARRÊTE — à reproduire, pas à réinterpréter

1. **Rien ne se replie.** Les deux `<details class="parametres-avances-pliable">` (« Paramètres
   avancés », « Seuils d'interprétation ») deviennent des blocs visibles, chacun avec un sous-titre
   (« Paramètres d'analyse », « Seuils d'interprétation »), ses étiquettes « où ça agit » et son bouton
   « Remettre… » à droite. Les trois cartes-piliers (`carte accordeon`) **restent ouvertes** : mesure ce
   que `accordeon-header` fait aujourd'hui (repli ?) et retire le repli si c'en est un — Grégoire : « pas
   trop d'accordéons qui se referment ».
2. **Un sommaire en tête** (« Sur cette page » : SOLO · ACP · RàI, ancres vers les trois cartes).
3. **Deux options par rangée** dans chaque pilier (`grille-2col`), chaque option dans un bloc
   (`opt` dans la maquette : case + nom en gras + aide + étiquettes). Le sélecteur de grille prend un
   bloc de la grille SOLO. RàI : un seul bloc pleine largeur.
4. **Une seule grammaire de seuil** : les trois `<input type="range">` (`v2-seuil-progression`,
   `v2-seuil-risque`, `v2-seuil-defi`) deviennent des **`<input type="number" class="controle-form">`**
   avec l'unité à droite (points / points / %), dans `grille-4col-form` avec la fenêtre d'analyse ; les
   trois seuils Fragile / Acceptable / Bon dans `grille-3col-form`. Les `<span id="v2-valeur-*">` et
   `mettreAJourAffichageSeuilV2` (`preferences-v2.js:432`, qui ne sert qu'à peindre l'étiquette d'un
   curseur) **partent** — zéro-dette.
   ⛔ **LE PIÈGE, mesuré** : les curseurs portent des **fractions** (`0.10`, `0.05`, `0.70` —
   `preferences-v2.js:412-420`) et `sauvegarderSeuilsV2` lit `parseFloat(el.value) || défaut`. Un champ
   qui affiche « 10 » et qu'on enregistre tel quel écrit **10** là où le calcul attend **0,10** : les
   flèches et le seuil de défi seraient faux pour tout le monde. **Convertis à la lecture ET à
   l'écriture (÷100 / ×100), et prouve-le par un essai qui exécute le vrai panneau** — la sentinelle
   `#823` (`tests/unit/sentinelle-823-fenetre-analyse-rebranchee.test.js`) et
   `sentinelle-555-2-curseur-seuil-defi.test.js` touchent ces identifiants : elles doivent rester
   vertes ou être adaptées, avec un break-test qui rougit si la conversion manque.
5. **Chaque réglage porte ses étiquettes « où ça agit »** (classe à créer, ex. `etiquette-effet`,
   variante ambre = hors de Suivi). ⚠ **Les textes des étiquettes viennent du § 4 du cadrage, pas de la
   maquette** : la maquette en a recopié la plupart, mais deux n'ont pas été vérifiées par Cowork
   (« Graphiques d'évolution ACP », « Collecte des données… »). Vérifie chacune contre la carte ; si la
   carte dit autre chose, c'est la carte qui a raison.
6. **Les deux « Restaurer »** gardent leurs fonctions et prennent le libellé de la maquette
   (« Remettre les valeurs par défaut (3 · 10 · 5 · 70) » / « (70 · 80 · 85) »), en `btn btn-secondaire
   btn-mini`, à droite de leur sous-titre. Le bouton « Enregistrer » de l'en-tête reste (décision de
   Grégoire du 9 sept., `#806 (c)`).
7. **Design-system** : les composants neufs (bloc d'option, étiquette « où ça agit », sous-titre de bloc
   avec bouton à droite) entrent dans `design-system.html`, mode sombre ET mode clair, avant d'être
   employés dans `index.html` — c'est le § 2 du skill `design-interface`. La maquette n'a été vue qu'en
   mode clair : **le mode sombre se règle avec les variables, et se regarde.**

**Ce qui ne change pas** : les identifiants des contrôles (les handlers `data-on-change` /
`data-on-input` et les préférences les lisent), les clés de données, les infobulles `data-tooltip`, les
textes d'aide de `1.129.2`, le bouton « Guide » de chaque pilier.

**Tranche toi-même** : le nommage des classes, le découpage des commits, l'ordre des lots, la forme des
essais. Dis ce que tu as supposé.

---

## CE QUI CHANGE À L'ÉCRAN — et qui doit être dit

Tout `Labo › Outils d'observation` change d'aspect ; **aucune valeur enregistrée ne change**, aucune
donnée n'est écrite chez personne. Un enseignant retrouve ses réglages aux mêmes valeurs, rangés
autrement, et trois curseurs sont devenus des champs.

⮕ **Release `minor`.** ⮕ **Entrée de changelog** (skill `release-et-changelog`), en langue d'utilisateur :
l'écran se lit sans rien déplier, chaque réglage dit où il agit, les seuils se tapent au lieu de se
glisser.

⮕ **Porte terrain DUE — Mac ET iPad** (skill `portes-terrain` ; markdown à toi, artefact à Cowork).
Quatre portes : (1) sur Mac, tout est visible sans rien déplier, le sommaire mène aux trois blocs, rien
ne déborde ; (2) **sur l'iPad en portrait** (les grilles de l'app passent à deux colonnes sous 900 px),
les quatre seuils tiennent sur deux rangées, les blocs d'option s'empilent sans chevauchement, les
étiquettes se lisent, en mode clair et en mode sombre ; (3) **la conversion** — tape 60 dans « Seuil de
défi spécifique », rouvre un profil : le diagnostic dit « seuil force : 60 % » (et pas 6000 %, ni 0,6 %) ;
remets 70 ; (4) les deux « Remettre… » remettent chacun leur jeu (3 · 10 · 5 · 70 / 70 · 80 · 85) et
rien d'autre. Sur `https://app.codexnumeris.org`, pas le fichier local.

---

## CE QUI REMONTE À GRÉGOIRE

1. **Rien, sauf un mot qui devrait changer** : si un libellé de la maquette ne peut pas tenir (place,
   chevauchement), ne l'abrège pas — dis-le.
2. Le reste est technique : tranche, puis dis-le en une ligne en nommant ce que tu as supposé.

⛔ **Hors périmètre** : le déplacement vers Suivi (temps 5, sa décision, après avoir vu la forme), les
cinq chemins morts (`#824`), le chargement lent (`#825`, plus tard aujourd'hui), les noms de zones et
les bornes (`#821`, `#822`), le modèle de cartouches et le pack démo. **Un lot, une livraison.**
