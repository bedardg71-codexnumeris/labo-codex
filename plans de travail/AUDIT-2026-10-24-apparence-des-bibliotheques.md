# Audit comparatif – l'apparence des bibliothèques (24 octobre 2026)

> Écrit par Cowork le samedi 24 octobre 2026 à 19 h 38 (Toronto), sur `main` = `dbdfc619` (Mac de Grégoire).
> **Mesuré à l'écran** sur 1.217.0 (`973ad366`, la version en ligne ; la fenêtre de bibliothèque n'a pas changé depuis), en mode démonstration, Chromium, 1440 × 900. **Non vérifié sur Safari ni sur iPad.**
> Captures : `captures-2026-10-24-audit-bibliotheques/` (les dix fenêtres en pleine hauteur, et les deux références).

## La demande

Grégoire, 19 h 30 : « Je voudrais qu'on repense l'interface des bibliothèques. Je trouve qu'elle n'est pas intuitive. Quand on compare avec le travail qu'on vient de faire sur les grilles de critères algorithmiques et sur les barres latérales, je trouve que l'apparence des bibliothèques semble un peu cacophonique et difficile à comprendre. Je voudrais que tu fasses un audit comparatif et que tu me proposes des modifications afin que nous puissions faire une ébauche HTML. »
Précision, 19 h 34 : « les critères algorithmiques dans les grilles de critères ».

**Hypothèse de travail (à confirmer)** : « l'interface des bibliothèques », c'est la fenêtre qui s'ouvre avec « Consulter la bibliothèque » (le composant commun `BibliothequeUI.creerModal`, `js/bibliotheque-ui.js`), pas la rangée de sélection refaite ce matin (#1147, #1148, #1151), qui sert ici de référence.

## 1. Les critères : ce que la référence fait bien

Tirés de l'éditeur du critère algorithmique (Conception › Grilles de critères, 1.216.0) et de la rangée de sélection (1.217.0).

| | Principe | Où on le voit dans la référence |
|---|---|---|
| C1 | **Ranger par rôle, et nommer le rôle** | La palette groupe ses blocs sous « Ce que tu écris dans la grille » et « Ce qui se remplit à la correction » |
| C2 | **Une couleur, un rôle** | Bleu pour ce que tu écris, vert pour ce qui se remplit, sans exception dans la palette |
| C3 | **Chaque élément dit à quoi il sert, en une ligne** | Chaque bloc porte son nom et sa phrase (« Le nombre compté sur la copie, à la correction… ») |
| C4 | **Montrer la conséquence** | « Essai sur des copies fictives », « L'élève lira : » |
| C5 | **Sobriété** | La rangée : un bouton, un menu, « + Nouvelle … » ; les badges retirés (décision du 24 oct., 12 h 10 : « Misons sur la sobriété ») |

⚠ Biais possible : ces critères sont dérivés de ce que Grégoire a aimé ; ils ne forment pas une grille d'ergonomie complète. La référence n'est pas exempte non plus (voir « Vu en passant »).

## 2. Les constats sur la fenêtre de bibliothèque

### Mesures

| Bibliothèque | Hauteur (px) | Sections | Boutons de fichier entre les listes | Outils d'organisation |
|---|---|---|---|---|
| Productions | 2 073 | « … dans ta sélection (11) » / « … disponibles à ajouter à ta sélection » | 4 | Mes dossiers |
| Grilles | 1 315 | idem, sans compteur | 4 | Mes dossiers, Masquer |
| Échelles | 869 | idem | 4 | Mes dossiers, Masquer |
| Cartouches | 1 552 | idem, groupées par grille | 3 | Filtrer par grille, Masquer |
| Pratiques | 1 346 | idem, + encadré d'aide | 3 | Mes dossiers |
| Cartes d'alignement | 496 | « Mes cartes d'alignement (trimestre actif) » / « Bibliothèque (1) » | 1 | – |
| Trimestres | 297 | « Trimestres disponibles » (une seule) | 0 | – |
| Cours | 464 | « Cours dans ta sélection (1) » / « Cours disponibles à ajouter » | 1 | – |
| Groupes-cours | 297 | « Groupe-cours dans le dropdown » (une seule) | 0 | – |
| Tampons | 2 967 | « Mes tampons (25) » groupés par catégorie / « Bibliothèque (0) » | 2 + 2 par catégorie | – |

### Constats

**B1 · Le modèle est invisible (contre C1, C3).** La fenêtre oppose « ta sélection » et « la bibliothèque » sans dire ce que c'est. Mesuré au code (`js/grilles.js`, `ajouterMesGrillesALaBibliotheque`) : « ta sélection », ce sont les objets du **trimestre actif** (`cle('grillesTemplates')`) ; « la bibliothèque », c'est ce qui est rangé **pour tous tes trimestres, et partageable avec des collègues**. Cette explication n'existe qu'à un endroit : la boîte de confirmation du bouton « Ajouter mes grilles à la bibliothèque ». Le titre de la fenêtre dit « Bibliothèque », mais sa première moitié montre le trimestre.

**B2 · Un même mouvement, plusieurs noms ; un même nom, deux mouvements (contre C3).**
- De la bibliothèque vers le trimestre : « Ajouter à ma sélection » (grilles, échelles), « Ajouter » (pratiques, cartes), « Reprendre dans ce trimestre » (cours : crée un groupe-cours dans le trimestre actif, `js/cours.js` l. 318 ; posé, lui, sur une carte de la liste dite « dans ta sélection »).
- Du trimestre vers la bibliothèque : « Ajouter mes grilles à la bibliothèque » (en bloc), « Partager » (cartes, tampons, à l'unité), « Exporter pour partager » (dans ⋮).
- Dans ⋮, « Retirer » et « Supprimer » côte à côte, sans dire de quoi on retire.

**B3 · La couleur ne veut rien dire (contre C2).** Mesuré au rendu :
- vert : Dupliquer, Ajouter à ma sélection, Partager, Reprendre dans ce trimestre, « Ajouter » (cartes) ;
- marine : « Ajouter » (pratiques), Ajouter mes … à la bibliothèque, Créer le dossier ;
- bleu moyen : tous les Exporter et Importer.
« Ajouter » existe en vert et en marine. Le vert sert au geste principal d'une carte de la sélection (Dupliquer) comme à celui d'une carte de la bibliothèque (Ajouter).

**B4 · Six sortes d'étiquettes, plus une puce technique (contre C5).** Codes HOLIS, MIXTE, STD, SOM, SPE, DEN (bordure noire) ; « Gabarit » (orange) ; « Trimestre actif » (vert) ; « Bibliothèque » (bleu) ; « Intégré » (gris) ; « Actif » **blanc sur blanc, illisible** (trimestres, groupes-cours ; voir les captures). Et sur chaque carte, la puce d'identifiant (#306842), née pour retrouver un doublon signalé (#291), affichée même quand rien n'est signalé.

**B5 · Les fichiers coupent la lecture.** Entre les deux listes, trois ou quatre boutons Exporter / Importer, centrés, sur deux lignes, avec leur format (« JSON », « .lcz »). La lecture « ce trimestre → la bibliothèque » est interrompue par des gestes qui n'ont rien à voir avec ce passage.

**B6 · La longueur.** Des cartes d'environ 100 px : 11 productions font 2 073 px, 25 tampons 2 967 px. La rangée de sélection, elle, ramène la même liste à un menu.

**B7 · L'organisation s'affiche avant le besoin.** « Mes dossiers » est déplié tant qu'il n'existe aucun dossier (`genererZone` : déplié si `reps.length === 0`) : un champ « Nom d'un nouveau dossier » s'affiche avant qu'on en veuille un. Contraire au principe du 19 oct. (simple d'abord, la fonction là où le besoin se présente). « Masquer les éléments déjà dans ta sélection » est présent dans trois des cinq bibliothèques de la Conception.

**B8 · Dix fenêtres, dix grammaires.**
- Titres de section : voir le tableau ci-dessus (« dans ta sélection », « (trimestre actif) », « Mes tampons », « disponibles », « dans le dropdown »).
- Sous-titres : « Gère … de ta sélection. » ; « Gère tes configurations de cours » (sans point) ; **« Gérez les groupe-cours affichés dans le dropdown de l'en-tête. »** et **« Partagez et réutilisez vos collections de tampons »** (vouvoiement ; anglicisme) ; « Active, clos ou rouvre tes trimestres. »
- Emoji : 📚 dans le titre des trimestres, 📁 dans la ligne d'une production.
- Compteurs dans quatre fenêtres sur dix.
- Typographie : « Type: », « Pondération: », « Objectif: » sans espace ; « noeud(s) » ; « critère(s) », « niveau(x) », « commentaire(s) ».

**B9 · Des cartes qui ressemblent à des liens.** Titres en bleu gras ; fond bleu pâle et bordure bleue pour la sélection ; fond blanc (grilles) ou gris (pratiques) pour la bibliothèque ; un filet gris au-dessus des boutons de chaque carte, sans fonction visible.

### Une cause commune (inférence, appuyée sur le code)

`creerModal` reçoit de chaque module des fragments HTML tout faits (`contenuSection1`, `boutonsApresSection1`, `filtresSection2`, `sectionImportTrimestre`, `sectionPartages`…), avec des styles en ligne. Chaque besoin (#291 les doublons, #293 « Masquer », #327 les dossiers, le partage, l'import d'un autre trimestre) a ajouté un bouton ou une zone à l'endroit libre. Le composant est commun ; **la grammaire, elle, appartient à chaque module**. C'est la source de la cacophonie : uniformiser l'apparence demande que le composant impose la structure, et que les modules ne fournissent plus que les données.

## 3. Les modifications proposées pour l'ébauche

**M1 · Deux colonnes nommées par ce qu'elles sont (le cœur).** Côte à côte : **« Dans ce trimestre »** (ce que le menu de l'écran propose) et **« Dans ta bibliothèque »** (pour tous tes trimestres, et pour partager). Une phrase sous chaque titre. Un seul geste par rangée pour passer de l'une à l'autre, orienté vers l'autre colonne. Répond à B1, B2. Applique C1, C3. Sur iPad en portrait : les colonnes s'empilent.

**M2 · Des rangées compactes.** Le nom, puis une ligne en clair (« Holistique · 5 critères ») ; les autres gestes dans ⋮ ; l'identifiant seulement quand un doublon est signalé. Répond à B4, B6, B9. Applique C5.

**M3 · Une couleur par rôle.** Marine pour le geste de passage ; neutre pour le reste ; rouge pour « Supprimer », dans ⋮ seulement. Répond à B3. Applique C2.

**M4 · Les fichiers sortent du milieu.** Un menu « Importer / exporter ▾ » dans l'en-tête de la fenêtre ; les formats n'apparaissent que dans ce menu. Répond à B5.

**M5 · L'organisation au besoin.** Dossiers, filtre et « Masquer » dans une petite barre au-dessus de la colonne bibliothèque ; « Créer un dossier » s'affiche quand on le demande. Répond à B7.

**M6 · Un seul gabarit pour les dix.** Mêmes titres, mêmes verbes, tutoiement, ni emoji ni « dropdown ». Les particularités (cartouches groupées par grille, trimestre actif ou clos) passent dans la ligne de description, pas dans une étiquette. Répond à B8 et à l'« Actif » illisible (B4).

**M7 · Montrer ce qu'on prend (à discuter, C4).** Toucher une rangée déplie un aperçu court de l'objet (pour une grille : ses critères et leur pondération) avant de le faire passer dans le trimestre. C'est l'équivalent, pour la bibliothèque, de « L'élève lira ». Facultatif pour la première ébauche.

**Ce qui remonte à Grégoire** : les mots que les utilisateurs liront, en particulier les noms des deux colonnes et le verbe du passage. L'ébauche en proposera ; il corrige.

## 4. Dispositions

| Constat | Disposition |
|---|---|
| B1 à B9 | **Retenus par Grégoire** (ébauche 1, 19 h 49) ; portés par le plan `PLAN-2026-10-24-bibliotheques-deux-colonnes.md`. Chacun devient « inscrit (n°) » quand Claude Code pose les fiches au lot 1 |
| B4, « Actif » blanc sur blanc | Défaut réel, absorbé par M6. Si l'ébauche ne se code pas cette semaine : **à inscrire** à part |
| M7 | À trancher par Grégoire devant l'ébauche |

## Vu en passant (hors du sujet)

- La palette du critère algorithmique a des blocs à liseré gauche, contraire à la règle du 24 oct. (bordures égales sur les quatre côtés) : **déjà couvert** par le lot 4 du plan du 24 oct. (#1150).

## 5. L'ébauche

- **Ébauche 1** (24 oct., vers 20 h, approuvée en principe par Grégoire à 19 h 40 : « oui ») : https://claude.ai/artifact/Ei1tPHTr1egbRmdTUR7jTm — la bibliothèque des grilles en deux colonnes, données de démonstration, vues Mac et iPad portrait. Applique M1 à M7.
- Mots proposés, **à valider par Grégoire** : « Dans ce trimestre » / « Dans ta bibliothèque » ; « Garder dans ma bibliothèque → » / « ← Utiliser dans ce trimestre » ; « Retirer de ce trimestre » / « Supprimer de ma bibliothèque » ; « Importer ou exporter ▾ ».
- Fait mesuré qui fonde la phrase « Ce que tu y modifies ne change pas l'exemplaire de ta bibliothèque » : prendre une grille de la bibliothèque crée dans le trimestre un nouvel objet (`ajouterGrilleIndividuelle`, `js/grilles.js` : nouvel `id`, `idOriginal` = la source). Le mot « copie » est évité : il désigne le travail numérisé d'un·e étudiant·e.
- Non dessiné : « Importer depuis un autre trimestre » (`sectionImportTrimestre`), qui serait une troisième source. À décider après l'ébauche.
- Verdict de Grégoire sur l'ébauche 1 (19 h 49) : « cette simplification est vraiment très efficace. »
- Portée, décidée par Cowork (mesurée sur les captures) : les deux colonnes valent pour les **huit** bibliothèques qui ont deux endroits (productions, grilles, échelles, cartouches, pratiques, cartes d'alignement, cours, tampons). Les **trimestres** et les **groupes-cours** n'ont qu'une liste : ils prennent seulement les rangées compactes, les couleurs et les mots (M2, M3, M6).
  ↻ **Corrigé à 20 h, mesuré au stockage** (`docs/DATA-OWNERSHIP.md`) : six de ces huit rangent leur colonne de gauche par trimestre ; les **cours** et les **tampons** sont globaux, « Dans ce trimestre » y serait faux. Leurs mots attendent Grégoire (plan, lot 5).
- 19 h 50 : Grégoire garde les mots de l'ébauche (« je les garde ») et demande un plan de travail pour Claude Code : `PLAN-2026-10-24-bibliotheques-deux-colonnes.md`, consigne du lot 1 `CONSIGNE-LOT-2026-10-24-bibliotheques-deux-colonnes-1.md`, maquette copiée sous `MAQUETTE-2026-10-24-bibliotheque-deux-colonnes.html`.
