# Demande de relecture – Les bibliothèques en deux colonnes, lot 2 : les échelles et les cartouches (#1155)

> Claude Code, dimanche 25 octobre 2026 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-25-bibliotheques-deux-colonnes-2.md` (et celle du lot 1, § 1 à § 5, avec son verdict). Branche `bibliotheques-deux-colonnes`. Pas de release, pas de verdict complet, pas de push.

## En bref

Les deux fenêtres (Conception › Échelles de performance, et › Cartouches de rétroaction, « Consulter la bibliothèque ») passent par le composant du lot 1. Les échelles reprennent les gestes des grilles. Les cartouches gardent leurs intertitres de grille dans chaque colonne, et « Filtrer par grille » passe dans la barre de la bibliothèque. Aucune rangée de cartouche du trimestre ne porte de passage. « Supprimer définitivement » ne retire plus l'exemplaire de la bibliothèque, et la question le dit quand cet exemplaire existe. La relation entre un élément du trimestre et son exemplaire existe maintenant une seule fois, dans `BibliothequeUI.lieeAExemplaire`, et les trois fenêtres la lisent. Les bancs des grilles n'ont pas eu à être retouchés pour rester verts.

## 1. Ce que j'ai mesuré, ce que j'ai supposé

**Mesuré**

- **Le sens bibliothèque → trimestre crée un objet séparé**, pour les échelles comme pour les cartouches : le nouvel objet reçoit un `id` neuf, et son `idOriginal` nomme l'exemplaire. Le banc le vérifie en modifiant la copie : l'exemplaire ne change pas (essais « mesure »).
- **Le sens trimestre → bibliothèque, pour les échelles** : `importerEchellesDansBibliotheque` copie l'échelle sous le même `id`, dans une autre clé. Modifier l'une ne change pas l'autre. **La seconde phrase de « Dans ce trimestre » est donc gardée pour les deux fenêtres.**
- **L'import d'échelles depuis un autre trimestre écrit dans la bibliothèque** (`ajouterEchelleALaBibliotheque`), pas dans ce trimestre. Celui des cartouches écrit dans ce trimestre. Voir l'écart 1.
- **`ajouterCartoucheALaBibliotheque` n'a aucun appelant.** Son commentaire dit « seul appelant : la migration au démarrage », ce qui est périmé. #1163 le note.
- **La démo n'a aucune échelle ni aucune cartouche dans la bibliothèque.** Le banc en sème, avec des noms fictifs. Le trimestre de la démo porte aussi « Échelle de départ (IDME) », que l'app pose au démarrage.

**Supposé**

- Le compte de la ligne en clair et de l'aperçu des cartouches ne retient que les commentaires **rédigés** (une case vide ne compte pas). Avant, la ligne disait « 20 commentaire(s) » en comptant les clés, cases vides comprises.
- Pour l'intertitre d'une cartouche de la bibliothèque, je prends dans l'ordre : son `grilleNom` ; à défaut, le nom de sa grille (son `grilleId` dans la bibliothèque des grilles, ou dans ce trimestre par `id` ou `idOriginal`) ; à défaut, « Autre » comme avant.

## 2. Les gestes de ⋮, fenêtre par fenêtre

| Fenêtre | Rangée | Avant | Maintenant |
|---|---|---|---|
| Échelles | trimestre | « Dupliquer » (bouton vert) ; ⋮ : Exporter pour partager, Retirer, Supprimer | « Garder dans ma bibliothèque → » (`garderEchelleDansBibliotheque` → `importerEchellesDansBibliotheque([e])`) ou « ✓ Aussi dans ta bibliothèque » ; ⋮ : « Dupliquer » (`dupliquerEchelleBibliotheque`), « Exporter pour partager », **« Retirer de ce trimestre »** (`retirerEchelleDeBibliotheque`), **« Supprimer définitivement »** (`supprimerEchelleDefinitivement`) |
| Échelles | bibliothèque | « Ajouter à ma sélection » ; ⋮ : Classer dans, Retirer du dossier, Supprimer | « ← Utiliser dans ce trimestre » (`ajouterEchelleIndividuelle`) ou « ✓ Déjà dans ce trimestre » ; ⋮ : « Classer dans : … », « Retirer du dossier », **« Supprimer de ma bibliothèque »** (`supprimerEchelleDeBibliothequePartagee`) |
| Échelles | en-tête de la colonne | « Ajouter mes échelles à la bibliothèque » | « Tout garder dans ma bibliothèque » (`ajouterMesEchellesALaBibliotheque`), quand au moins deux échelles du trimestre n'y sont pas |
| Cartouches | trimestre | « Dupliquer » ; ⋮ : Exporter pour partager, Retirer, Supprimer | **aucun passage** ; « ✓ Aussi dans ta bibliothèque » quand la relation le dit ; ⋮ : « Dupliquer », « Exporter pour partager », « Retirer de ce trimestre » (`retirerCartoucheDeBibliotheque`), « Supprimer définitivement » (`supprimerCartoucheDefinitivement`) |
| Cartouches | bibliothèque | « Ajouter à ma sélection » ; ⋮ : Supprimer | « ← Utiliser dans ce trimestre » (`ajouterCartoucheIndividuelle`) ou « ✓ Déjà dans ce trimestre » ; ⋮ : « Supprimer de ma bibliothèque » (`supprimerCartoucheDeBibliothequePartagee`) |

Chaque libellé fait ce qu'il dit, comme pour les grilles au lot 1. Je n'ai pas eu à garder d'ancien libellé.

Le menu « Importer ou exporter ▾ » de chaque fenêtre contient : « Importer des échelles » ou « Importer des cartouches » (l'import JSON d'aujourd'hui), « Importer le partage d'une ou d'un collègue », un séparateur, « Exporter les échelles de ce trimestre » ou « Exporter les cartouches de ce trimestre », puis la note « Fichiers .json et .lcz ». Chaque entrée garde son action.

## 3. Les phrases

| Phrase | Gardée ou retirée |
|---|---|
| « Les échelles / cartouches que le menu de l'écran te propose pendant ce trimestre. Ce que tu y modifies ne change pas l'exemplaire de ta bibliothèque. » | **Gardée** dans les deux fenêtres (mesure du § 1) |
| « Les échelles / cartouches que tu gardes pour tous tes trimestres. » | Gardée, sans « C'est d'ici que tu peux les partager. » (même raison qu'au lot 1) |
| « Son exemplaire de ta bibliothèque reste. » | Ajoutée aux questions de « Supprimer définitivement », seulement quand la relation lie l'élément à un exemplaire. **Échelles** : la confirmation simple et la question du remplaçant (quand des évaluations l'emploient), toutes deux dans `supprimerOuRemplacerEchelle`. Ses trois appelants (`supprimerEchelleDefinitivement`, `supprimerEchelle`, `supprimerEchelleDepuisSidebar`) gardent tous l'exemplaire : la phrase est vraie partout. **Cartouches** : elle remplace « Elle part aussi de la Bibliothèque. » ; la relation passe de l'`id` seul à l'`id` ou l'`idOriginal` |
| « ta sélection » → « ce trimestre » | Notifications d'ajout (« Échelle ajoutée à ce trimestre ! », « Cartouche ajoutée à ce trimestre ! ») ; refus de la garde #476 (« « X » est déjà dans ce trimestre. ») ; lieux du bandeau des doublons (option `mots`) ; case « Masquer ce qui est déjà dans ce trimestre » ; notification d'import : « Elles sont dans ta bibliothèque : « Utiliser dans ce trimestre » les ajoute à ce trimestre. » (mots des grilles) |

## 4. § 3.4 et § 3.5 de la consigne

- **§ 3.4 : oui, rattaché à #1161.** Mesuré par une sonde WebKit jetable : une échelle fictive ramenée par « ← Utiliser », puis « Tout garder ». La bibliothèque porte alors l'exemplaire **et** un second exemplaire sous l'`id` neuf, parce qu'`ajouterEchelleALaBibliotheque` ne teste que l'`id`. Non corrigé. Les cartouches ne sont pas concernées : elles n'ont pas de « Tout garder ».
- **§ 3.5, échelles : oui, rattaché à #1160.** Une échelle absente de la bibliothèque et retirée de ce trimestre n'apparaît plus ni dans la fenêtre ni à l'écran. Ses données restent (`dansBibliotheque: false`). Non corrigé.
- **§ 3.5, cartouches : non.** La section 2 d'avant listait déjà les cartouches retirées avec les disponibles. Je les ai laissées dans « Dans ta bibliothèque », pour qu'aucune ne devienne introuvable par ce lot (écart 3).

## 5. Les bancs

**Neuf** : `tests/integration/bibliotheque-deux-colonnes-1155.spec.js`, 16 essais WebKit dans le vrai `index.html` depuis la démo, à 1 440 et à 820 px, plus l'essai des captures (`CAPTURES_1155`). Chaque famille d'assertions a son break-test, listé en tête du fichier. Tous rougissent. Un seul restait vert d'abord : remettre `retirerCartoucheDeLaBibliotheque` ne changeait rien, parce que la cartouche ramenée a un `id` neuf. J'ai ajouté une cartouche présente des deux côtés sous le même `id`, et ce break-test rougit maintenant.

**Réancrés**, chacun avec son motif écrit dans le fichier et un break-test qui rougit :

| Banc | Motif | Break-test |
|---|---|---|
| `unit/sentinelle-biblio-identite-productions` | la relation unique est montée dans `BibliothequeUI.lieeAExemplaire` | « Déjà » des échelles par `id` seul → ROUGE |
| `unit/sentinelle-647-suppression-cartouche-dit-vrai` | le chemin 3 n'écrit plus que l'ancrage, et la question dit « Son exemplaire de ta bibliothèque reste. » ; nouvel essai sur la cartouche ramenée ; la relation est extraite du fichier par `tranche()` | l'ancienne phrase → ROUGE ; la relation par `id` seul → ROUGE ; `idOriginal` retiré de `lieeAExemplaire` → ROUGE |
| `unit/sentinelle-1007-propose-codex` (P23-24, P27) | la question porte `+ phraseBibliotheque` ; l'effacement de P27 est le filtre de l'ancrage | l'appel au codex retiré (P27, P23-24) → ROUGE |
| `unit/sentinelle-467-affichage-echappe` (C.t) | le nom des rangées passe en texte (×2) dans `echelles.js` et `cartouches.js`, et le composant l'échappe | compte exact |
| `unit/sentinelle-658-aucun-conteneur…` | le composant pose aussi les ids passés en configuration (`selectId`, `apercuId`, `idListe`, `champsFichier`) | un `selectId` renommé → ROUGE |
| `unit/sentinelle-textes-relus-15-oct` (Bloc 2) | la section d'import des trois fenêtres en deux colonnes est une configuration | `aide` retirée des échelles → ROUGE |
| `unit/cartouches-import-trimestre` (essai 8) | `genererSectionImportTrimestreCartouches` est retirée, et le composant rend la section | sélecteur renommé → ROUGE |
| `fixtures/cliquets/classes-sans-regle-679.json` | le cliquet descend : `biblio-groupe-repertoire` a quitté `echelles.js` | aucun (le cliquet ne fait que descendre) |
| `integration/bibliotheques-import-persistance` | la section d'import est un repli à ouvrir ; le repli ouvert doit survivre à l'import ; page réduite à 560 px de haut pour que la fenêtre défile | le repli non retenu par `_capturerDeuxColonnes` → ROUGE |
| `integration/repertoires-echelles-T2-rendu` | plus de boîte « Mes dossiers » dépliée ni de liste déroulante par dossier : le menu de la barre, `data-dossier` sur la rangée, « Classer dans » et « Retirer du dossier » au ⋮ | `dossier` retiré de la rangée → ROUGE |
| `integration/bibliotheques-menu-1147` (sous-titres) | les deux fenêtres n'ont plus de sous-titre : l'essai lit la phrase de « Dans ce trimestre », comme pour les grilles | « te propose » → « vous propose » → ROUGE |

**Inchangés et verts** : `bibliotheque-deux-colonnes-1154` (les grilles, 10 + 1 sauté), `doublons-bandeau-291`, `repertoires-grilles-T1-rendu`, `cartouches-import-trimestre` (7), `doublons-lisibilite-291`, `import-preview-inter-trimestre-prod-echelles`, `partage-import-rendu`. Vitest : tout vert, sauf l'anti-cache attendu sur la branche (jetons du 25, verdict du lot 1, § 1).

## 6. Mes écarts avec la consigne

1. **« Importer depuis un autre trimestre » est au pied de « Dans ta bibliothèque » pour les échelles**, et non de « Dans ce trimestre » comme au lot 1. Raison : cet import écrit dans la bibliothèque (§ 1). Les cartouches, qui importent dans ce trimestre, gardent la place des grilles, avec leur phrase « Une cartouche arrive toujours avec sa grille… » (option `phrase` ajoutée au composant). ⚠ La bulle de « Tout importer » des échelles (`import-trimestre-tout-echelles`) dit « Copie toutes les échelles de ce trimestre dans ton trimestre actif ». C'est faux aujourd'hui, avant comme après le lot : ce sont des mots que Grégoire lit, je ne les ai pas touchés. **Question pour Cowork.**
2. **La marque « (gabarit) » et son style en ligne sont partis** de la rangée de bibliothèque des échelles, comme le badge des grilles au lot 1. La ligne dit « par <auteur> » quand l'auteur n'est pas l'utilisateur.
3. **Les cartouches retirées restent dans « Dans ta bibliothèque »**, sous l'intertitre de leur grille, avec une ligne neuve : « Retirée de ce trimestre · N commentaires ». « ← Utiliser dans ce trimestre » les remet, comme le faisait « Ajouter à ma sélection ». Leur ⋮ est vide. Le « Supprimer » d'avant n'y faisait rien : `supprimerCartoucheDeBibliothequePartagee` ne trouve pas une cartouche absente de la bibliothèque, donc aucun geste n'est perdu. Je n'ai pas trouvé mieux sans geste neuf. **« Retirée de ce trimestre » est un mot neuf, à soumettre à Grégoire.** L'autre voie serait la troisième liste de #1160.
4. **« Filtrer par grille » est une liste déroulante sans étiquette visible** : son nom accessible est « Filtrer par grille », et sa première option « Toutes les grilles ». Je l'ai fait pour qu'elle ressemble au menu des dossiers des deux autres fenêtres. Avant, l'étiquette « Filtrer par grille : » était visible au-dessus.
5. **Le composant gagne quatre options** (`rangee.groupe`, `filtreGroupe`, `masquer`, `importAutreTrimestre.phrase`), ainsi que `BibliothequeUI.lieeAExemplaire` et `BibliothequeUI.choisirGroupe`. Les grilles ne les emploient pas, et ce qu'elles reçoivent du composant n'a pas changé. `grilleLieeAExemplaire` (grilles.js) est retiré au profit de la relation commune.
6. **Retirés, faute de lecteur** : `genererSectionImportTrimestreCartouches` et `filtrerCartouchesParGrille` (avec leurs exports), et les aperçus d'import avec styles en ligne (`afficherEchellesTrimestreModal`, `afficherCartouchesTrimestreModal`), réécrits avec les classes du lot 1.
7. **La complexité** : `_renderColonne` montait à 16. La barre et la phrase de filtre en sont sorties, et la fonction est revenue sous 15 (le cliquet reste à 447). `supprimerOuRemplacerEchelle` passe de 22 à 23 : le compte n'est pas bloquant.

**Fichiers touchés** : `js/bibliotheque-ui.js`, `js/echelles.js`, `js/cartouches.js`, `js/grilles.js` (la relation seulement), `styles.css`, `index.html` (jetons), `BACKLOG.md`, le plan, les bancs. Je n'ai touché ni `js/config.js` ni `js/navigation.js`. Les fonctions de même nom de `js/donnees-v2.js` (onglet Données) n'ont pas changé : c'est un autre geste. **Stock** : rien. Les échelles et les cartouches déjà supprimées ont perdu leur exemplaire.

## 7. Les trouvailles

| Trouvaille | Issue |
|---|---|
| « Garder une cartouche dans ma bibliothèque » : le geste n'existe pas, et la question du `grilleId` reste à trancher | **Inscrit : #1163** (consigne, § 2.2). #1162 est pris sur `main` : le compteur de la branche dit #1163, et les deux lignes se rejoignent à la fusion |
| « Tout garder » verse un second exemplaire d'une échelle ramenée | **Rattaché à #1161** |
| Une échelle retirée et absente de la bibliothèque devient introuvable | **Rattaché à #1160** (les cartouches, non : § 4) |
| La bulle « Tout importer » des échelles promet « dans ton trimestre actif » alors que l'import va dans la bibliothèque | **Question pour Cowork** (mots lus par Grégoire), écart 1 |
| La suppression d'une cartouche depuis l'écran (`supprimerCartoucheConfirm`, chemin 2 de #647) dit « Elle reste dans la Bibliothèque. », et ne lit la relation que par l'`id`. Pour une cartouche ramenée, elle ne dit donc rien | **Nommée ici, sans fiche** : aucun symptôme vécu (règle du 24 août), hors des deux fenêtres. À Cowork de décider s'il faut aligner ces mots sur « Son exemplaire de ta bibliothèque reste. » |
| Après « ← Utiliser », la copie et son exemplaire portent le même nom, et le bandeau des doublons les nomme (#291, catégorie de la même lignée). C'était déjà le cas pour les grilles au lot 1 et dans les anciennes fenêtres | **Commenter et oublier** : comportement voulu de #291, dit dans le banc |
| Le commentaire de `ajouterCartoucheALaBibliotheque` (« seul appelant : la migration ») est périmé | **Noté dans #1163** |

## 8. Captures

`plans de travail/captures-2026-10-25-bibliotheques-deux-colonnes-2/` : échelles et cartouches, Mac 1 440 clair et sombre (un aperçu et un ⋮ ouverts), iPad 820 clair.
