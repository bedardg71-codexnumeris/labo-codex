# Mesure – barre d'outils de la carte d'alignement (lot 0, lecture seule)

> Mesurée par Claude Code le 8 octobre 2026, à partir de 14 h 28 (heure de `date`), sur `main` à `803f2c5d`. Consigne : `plans de travail/CONSIGNE-2026-10-08-alignement-lot0-mesure.md`. Plan : `plans de travail/PLAN-2026-10-08-chantier-carte-alignement.md`.
> **Mesure au code seulement** (lecture, `grep`) : aucun navigateur ouvert, aucun essai lancé. Ce qui relève du comportement du navigateur est marqué **[inférence]**.
> Aucune décision ici : les propositions icône par icône reviennent à Cowork.

## Vue d'ensemble

| Point | Ce que la mesure montre |
|---|---|
| 1. Barre | **16 éléments visibles** en permanence (+ 1 bouton d'effacement qui n'apparaît qu'en recherche), dont **9 icônes sans mot**. Le menu « Actions ▾ » porte 14 commandes. |
| 2. Raccourcis | 13 lignes dans la palette. **0 décrit et non branché** au code ; **1 probablement avalé par le navigateur** (⌘1) [inférence] ; **2 descriptions inexactes** ; **8 gestes branchés mais non décrits**. |
| 3. Planificateur horizontal | Préférence `planifReserveDisposition` (`'bas'` défaut / `'gauche'`) dans `preferencesUtilisateur`, globale. Retrait sans effacement possible. |
| 4. Dates | `cadreCalendrier` (par trimestre) : `dateDebut`, `finCours`, `finTrimestre`. Proposition : `dateDebut` → `finTrimestre`. |
| 5. Menus | ⚠ **Il n'existe pas de menu qui porte le nom de la carte** : le nom est dans un sélecteur, à côté d'un menu « Actions ▾ ». Le menu « Annoter » d'« Annoter et évaluer » est, lui, un menu « Actions » dont le titre prend le nom du mode. |

---

## 1. Inventaire de la barre

Source : `index.html:4180-4287`. Trois groupes : gauche (carte), centre (recherche), droite (vue et outils).

### Groupe gauche – la carte

| # | Affiché | Ce que ça fait | Raccourci | Équivalent ailleurs | Preuve |
|---|---|---|---|---|---|
| 1 | Sélecteur (nom de la carte + code du cours) | Change de carte | – | Bibliothèque (#16) pour ouvrir une carte d'ailleurs | `index.html:4184`, `planification-carte.js:8477-8502` |
| 2 | « Actions ▾ » | Ouvre 14 commandes (tableau ci-dessous) | – | – | `index.html:4186-4206` |
| 3 | Icône + « Annuler » | Annule le dernier geste | ⌘Z (infobulle dit « Ctrl+Z ») | ⌘Z ; **pas de bouton « Rétablir »** | `index.html:4218`, `planification-carte.js:9395-9396` |

Contenu d'« Actions ▾ » (`index.html:4188-4205`) : Nouvelle carte · Renommer cette carte · Cours rattaché… · Nettoyer les repères de semaine… · Liens : contourner les blocs · Décloner la sélection · Dupliquer cette carte · Importer une carte (fichier) · Importer d'un autre trimestre… · Exporter le plan… · Exporter cette carte · Télécharger un modèle… · séparateur · Supprimer cette carte. Cinq ouvrent un panneau du même patron (`index.html:4208-4216`).

Observation : « Décloner la sélection » agit sur des **blocs**, les 13 autres sur la **carte entière** (le commentaire `index.html:4192-4194` dit d'ailleurs que ce menu porte « un réglage de la carte entière »).

### Groupe centre – la recherche

| # | Affiché | Ce que ça fait | Raccourci | Preuve |
|---|---|---|---|---|
| 4 | Champ « Rechercher dans la carte… » + compteur | Allume les blocs qui correspondent ; liste de résultats | Entrée, ⇧Entrée, ↑, ↓, Échap (dans le champ) | `index.html:4232-4244`, `planification-carte.js:12241-12262` |
| – | ✕ (n'apparaît qu'en recherche) | Efface la recherche | Échap | `index.html:4238-4241` |

### Groupe droite – vue et outils

| # | Affiché | Ce que ça fait | Raccourci | Équivalent ailleurs | Preuve |
|---|---|---|---|---|---|
| 5 | « Nœuds » | Montre / masque la palette des nœuds | – | – | `index.html:4248`, `planification-carte.js:9945` |
| 6 | « Planificateur » | Montre / masque le planificateur | – | – | `index.html:4249`, `planification-carte.js:9951` |
| 7 | Icône **double cercle** (`icon-final-state`) | Recentrer : défile vers le centre **moyen** des blocs, sans toucher au zoom | ⌘1 | ⌘0 fait la même chose **après** avoir remis le zoom à 100 % | `index.html:4250`, `planification-carte.js:11508-11510`, `6533-6551` |
| 8 | Icône **flèches vers l'intérieur** (`icon-collapse`) | Tout voir : ajuste le zoom (≤ 100 %) pour que toute la carte tienne, puis centre | – | – | `index.html:4255`, `planification-carte.js:11551-11587` |
| 9 | Icône **loupe** (`icons8-chercher`) | Loupe : lire sans changer le zoom | L | – | `index.html:4256`, `planification-carte.js:9562-9566` |
| 10 | « 100% » (texte, non cliquable) | Affiche le zoom courant | – | – | `index.html:4257`, `planification-carte.js:2862-2868` |
| 11 | Icône **palette de peintre** | Ouvre 12 pastilles de fond | – | Même jeu de 12 pastilles dans le menu « Annoter » | `index.html:4258-4274`, `planification-carte.js:12522-12553` |
| 12 | Icône **flèches vers l'extérieur** (`icon-fit-to-width`) | Plein écran ; l'icône **devient `icon-collapse`** une fois en plein écran | Échap pour sortir | – | `index.html:4275`, `planification-carte.js:12555-12575` |
| 13 | Icône **loupe à détails** (`icon-advanced-search`) | Ouvre / ferme l'Inspecteur du bloc sélectionné ; **sans sélection, ne fait rien et ne le dit pas** | – | Double-tap sur un bloc | `index.html:4281`, `planification-carte.js:8932-8941` |
| 14 | Icône **raccourci** (`icon-shortcut`) | Ouvre la palette flottante des raccourcis | – | – | `index.html:4282`, `planification-carte.js:8944-8999` |
| 15 | Icône **livre** | Ouvre le Guide | – | – | `index.html:4283`, `planification-carte.js:9002-9011` |
| 16 | Icône **bibliothèque** | Ouvre la bibliothèque de cartes d'alignement | – | – | `index.html:4284`, `planification-carte.js:9420-9427` |

Compte (pour recouper le relevé de Cowork) : 27 ids `planif-btn-*` dans `index.html`, mais **seuls 13 sont dans la barre** (dont 11 dans « Actions ▾ ») ; les autres sont dans l'Inspecteur (cloner, supprimer, fermer), le planificateur (disposition) et le menu Actions. 6 ids `planif-palette-*` : 4 boutons de la barre (#13 à #16) + les palettes `planif-palette` et `planif-palette-nav`.

### Ce qui me paraît ambigu (lecture, pas décision)

| Constat | Preuve |
|---|---|
| **Même icône pour deux gestes** : « Tout voir » et le bouton plein écran **une fois actif** utilisent tous deux `icon-collapse`. | `index.html:4255`, `planification-carte.js:12565` |
| **Deux loupes** côte à côte : Loupe et Inspecteur. Le code le savait (il refuse une troisième pour la recherche). | `index.html:4221-4226` (commentaire), `4256`, `4281` |
| **Trois gestes de recadrage** dont deux presque jumeaux : Recentrer (⌘1), ⌘0 (100 % + recentrer), Tout voir. | `planification-carte.js:9550-9556`, `11508`, `11551` |
| **Inspecteur muet sans sélection** : le clic ne produit rien. | `planification-carte.js:8935-8939` |
| **« Annuler » sans « Rétablir »** : ⇧⌘Z et ⌘Y existent mais aucun bouton (iPad : pas de rétablir du tout). | `planification-carte.js:9594-9600` |
| **Neuf icônes sans mot** (#7, 8, 9, 11, 12, 13, 14, 15, 16) ; le Guide n'a même pas de `title`, seulement une infobulle d'aide. | `index.html:4283` |
| Rarement utile, **[inférence]** sans journal d'usage : Bibliothèque, palette des raccourcis (que Grégoire veut retirer), indicateur « 100% » non cliquable. | – |

---

## 2. Les raccourcis

Liste affichée : `index.html:4403-4417` (13 lignes). Gestionnaire global : `planification-carte.js:9520-9628`, actif seulement quand la section Conception est ouverte et hors d'un champ de saisie (`9521-9530`).

### Décrits dans la palette

| Affiché | Branché ? | Fait-il ce qu'il dit ? | Preuve |
|---|---|---|---|
| Suppr – Supprimer | Oui | Oui (sélection simple ou multiple) | `9603-9618` |
| ⌘A – Tout sélectionner | Oui | Oui | `9532-9536` |
| ⌘+Clic – Multi-sélection | Oui | Oui | `6991-6994` |
| Rectangle – Sélection par zone | Oui (glisser sur le fond) | Oui, **à la souris seulement** (au doigt, le fond défile) | `9149-9154` |
| ⌘+/- – Zoom | Oui | Oui | `9538-9549` |
| ⌘0 – « Reset zoom » | Oui | **En partie** : remet à 100 % **et** recentre ; libellé en anglais | `9550-9557` |
| ⌘1 – Recentrer | Oui au code | **[inférence forte]** Chrome et Safari réservent ⌘1 au premier onglet : il est probable que le geste change d'onglet au lieu de recentrer. **À vérifier à l'écran.** | `9568-9572` |
| ⌘D – Dupliquer | Oui | Oui (copie indépendante) | `9574-9587` |
| ⌥+Glisser – Dupliquer en déplaçant | Oui | Oui (copie indépendante) | `7004-7008` |
| Glisser – bloc seul / groupe par le cadre | Geste souris/doigt | Non mesuré en détail (hors clavier) | `6985-6990` |
| ⌘Z – Annuler | Oui | Oui ; mais le bouton « Annuler » annonce « Ctrl+Z » | `9589-9593`, `index.html:4218` |
| Entrée / ⇧Entrée – résultat suivant / précédent | Oui (dans le champ) | Oui | `12246-12251` |
| Échap – refermer la liste, puis effacer | Oui (dans le champ) | Oui | `12254-12261` |

### Branchés mais non décrits (8)

| Geste | Ce qu'il fait | Preuve |
|---|---|---|
| L | Loupe (dit seulement dans l'infobulle du bouton) | `9562-9566` |
| ⇧⌘Z et ⌘Y | Rétablir | `9594-9600` |
| Retour arrière (⌫) | Supprimer, comme Suppr | `9603` |
| ⇧⌘D | Dupliquer en **clone lié** | `9574-9587` |
| ⇧⌥+Glisser | Dupliquer en **clone lié** | `7004-7005` |
| ↑ / ↓ dans la recherche | Résultat suivant / précédent | `12252-12253` |
| Échap hors recherche | Ferme la loupe, sinon désélectionne et ferme le menu de lien ; **et** quitte le plein écran | `9620-9624`, `12571-12575` |
| Ctrl + molette / pincement du trackpad | Zoom | `8689-8694` |

### Combien ne marchent pas

Au code : **aucun** raccourci décrit n'est absent. Ce qui reste à l'écran : **⌘1** probablement intercepté par le navigateur [inférence], et **deux descriptions inexactes** (⌘0 « Reset zoom » qui recentre aussi ; « Ctrl+Z » sur le bouton Annuler). La vérification de ⌘1 (et, par prudence, de ⌘D et ⌘0 que les navigateurs réservent aussi) est une porte terrain : aucune machine ici ne peut y répondre sans lancer Playwright, interdit par la consigne.

---

## 3. La présentation horizontale du planificateur

**Ce que c'est** [inférence sur le mot de Grégoire] : la disposition « réserve à gauche », où la colonne « Non planifié » se place **à côté** de la grille des semaines – d'où des leçons non planifiées à la même hauteur que des semaines. La verticale, c'est « réserve sous la grille ».

| Élément | Preuve |
|---|---|
| Bouton ◧ dans la barre du planificateur | `index.html:4425`, `planification-carte.js:9323-9330` |
| Lecture de la préférence | `planification-carte.js:9891-9898` |
| Bascule + élargissement de la palette à 520 px | `planification-carte.js:9905-9925` |
| Libellés du bouton | `planification-carte.js:10000-10015` |
| Rendu côte à côte (`planif-cotecote`, `planif-reserve-colonne`) | `planification-carte.js:10472`, `10546`, `10553-10555` |
| CSS | `styles.css:21083` (`.planif-reserve-colonne`), `21108-21114` (rotation du glyphe) |
| Préférence | `planifReserveDisposition`, défaut `'bas'`, valeurs `'bas'` / `'gauche'` (`js/preferences.js:97`) dans `preferencesUtilisateur`, **globale** (`docs/DATA-OWNERSHIP.md:127`) |
| Essais qui la verrouillent | `tests/unit/sentinelle-disposition-reserve.test.js` (tout le fichier), `tests/integration/planif-zone-non-planifie-929.spec.js:143` |

**Ce que devient un usager qui l'avait choisie** : si la lecture cesse (la fonction rend toujours `'bas'`), il retombe sur la verticale. **Rien n'est effacé** : la valeur `'gauche'` reste dans `preferencesUtilisateur`, simplement plus lue. Une seule séquelle visible : la palette a pu être élargie à 520 px lors de la bascule (`9915-9923`) ; cette largeur reste, c'est un réglage de l'usager. Question pour le lot 2 (zéro-dette) : retirer aussi la clé de `DEFAUTS` (`preferences.js:97`) – `obtenirPreference` avertit alors en console sur une clé inconnue (`preferences.js:161-163`) ; il faut donc retirer **tous** les lecteurs ensemble.

---

## 4. Les dates du trimestre

Source : `cle('cadreCalendrier')`, **par trimestre** (`trimestre-v2.js:157`, `trimestre-v2-init.js:404`). Écran : Cadre › Trimestre, bloc « Bornes du trimestre » (`index.html:6236-6258`).

| Champ stocké | Libellé à l'écran | Obligatoire | Preuve |
|---|---|---|---|
| `dateDebut` (ancien : `debutTrimestre`) | « Début du trimestre » | Oui | `index.html:6243-6244`, `trimestre-v2-init.js:409`, `trimestre-v2.js:78` |
| `finCours` | « Fin des cours réguliers » | Oui | `index.html:6247-6248`, `trimestre-v2-init.js:410` |
| `finTrimestre` | « Fin du trimestre » | Oui | `index.html:6251-6252`, `trimestre-v2-init.js:411` |
| `remiseNotes` | « Remise des notes » | Non | `index.html:6255-6256` |

**Proposition** (à trancher par Grégoire, c'est le sens d'un mot) : `dateDebut` → `finTrimestre`. Motifs : c'est le champ que l'écran du Cadre appelle littéralement « Fin du trimestre » ; et la grille du planificateur couvre déjà la semaine d'examens, qui tombe après `finCours` (`planification-carte.js:10047-10049`). L'autre lecture possible : `finCours`, si la date doit dire la fin de l'enseignement.

**À savoir pour l'invitation** : le planificateur affiche déjà un avis quand le Cadre manque – « Semaines dérivées des leçons — configure le Cadre du trimestre (Réglages) pour les rangées réelles. » (`planification-carte.js:10468-10469`). Deux choses : il renvoie à « Réglages » alors que la section s'appelle « Cadre » dans la navigation (`index.html:4108`, `6115`) ; et la nouvelle invitation devra **le remplacer**, pas s'y ajouter. Les deux cas ne coïncident pas : l'avis paraît quand `calendrierComplet` manque, les dates quand `cadreCalendrier` manque.

---

## 5. Le menu de la carte et le menu « Annoter »

### Écart avec la prémisse

Le plan parle du « menu qui porte le nom de la carte (« Sans titre ») ». **Ce menu n'existe pas** : le nom de la carte vit dans un **sélecteur** natif (`index.html:4184`), et les commandes dans un menu à part, « Actions ▾ » (`index.html:4186`). « Sans titre » est le nom par défaut d'une carte (`planification-donnees.js:58`), donc ce qu'affiche le sélecteur.

### Le modèle « Annoter » (`travaux-ui.js:1178-1206`)

| Partie | Contenu |
|---|---|
| Bouton | Un menu « Actions » (`id="travaux-btn-actions"`) dont le titre **devient le mode courant** : « Annoter ▾ » ou « Évaluer ▾ » (`travaux-ui.js:589-592`) |
| Rubrique 1 | Annoter · Évaluer (les deux modes) |
| séparateur | |
| Rubrique 2 | Modifier |
| séparateur | |
| Rubrique 3 | Sous-titre « Fond du canevas » (`actions-sous-titre`) puis **les 12 pastilles en ligne** (`actions-fond-swatches`), directement dans le menu, sans sous-menu |

Même jeu de 12 couleurs que la carte (`index.html:4261-4272` ↔ `travaux-ui.js:1191-1202`), à une différence près : la pastille « Défaut » de la carte s'appuie sur `--surface-page`, celle d'Annoter sur `--surface-conteneur`. CSS de la rubrique : `styles.css:25555`, `25560`. Le déplacement d'Annoter date du retour testeur du 23 sept. 2026 (`travaux-ui.js:1187`).

### Ce que ça implique pour le lot 1 (lecture, pas décision)

Pour suivre le modèle, il y a deux voies, à arbitrer par Cowork puis Grégoire : soit la rubrique « Fond » entre dans « Actions ▾ » (le plus proche du modèle, qui est lui aussi un menu Actions) ; soit le sélecteur et « Actions ▾ » fusionnent en un seul menu titré du nom de la carte (ce que décrit la prémisse, mais c'est un chantier de plus).

Point à savoir : le fond de la carte est **global**, pas par carte ni par trimestre – clé `planif-fond-canvas` lue et écrite sans `cle()` (`planification-carte.js:12540`, `12549`). Le ranger dans un menu titré du nom de la carte laisserait croire qu'il ne vaut que pour elle. Ni `planif-fond-canvas` ni `travaux-fond-canvas` (`travaux-ui.js:7561`) ne figurent dans `docs/DATA-OWNERSHIP.md`.

---

## Trouvailles faites en chemin (issue nommée)

| Trouvaille | Issue |
|---|---|
| L'avis du planificateur renvoie à « Réglages » au lieu de « Cadre » (`planification-carte.js:10469`) | **Inscrire et continuer** – à régler dans le lot 2 qui réécrit cet endroit |
| « Recentrer » est branché deux fois au clic : `data-action` (`index.html:4250`) **et** un écouteur (`planification-carte.js:9497-9498`) ; même effet, exécuté deux fois | **Inscrire et continuer** – le lot 1 réécrit ce bouton |
| `planif-fond-canvas` et `travaux-fond-canvas` absents du registre `DATA-OWNERSHIP.md` | **Inscrire et continuer** |

Rien n'a été écrit ailleurs que dans ce fichier (consigne : ni `BACKLOG.md`, ni code, ni git).
