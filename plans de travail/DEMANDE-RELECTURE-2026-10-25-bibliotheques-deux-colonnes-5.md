# Demande de relecture – Les bibliothèques en deux colonnes, lot 5 : les tampons (#1158), et la retouche du lot 4 (#1157)

> Claude Code, dimanche 25 octobre 2026, fin d'après-midi. Branche `bibliotheques-deux-colonnes` : consigne et verdict du lot 4 `cfcf61d8` (docs) ; retouche du lot 4 `b481e947` (`fix(bibliotheques)`) ; lot 5 `39e1c202` (`feat(bibliotheques)`). `main` = `9c94f30d`, non touché.
> Consigne : `CONSIGNE-LOT-2026-10-25-bibliotheques-deux-colonnes-5.md`. Captures : `captures-2026-10-25-bibliotheques-deux-colonnes-5/` (les tampons, Mac 1 440 clair et sombre, avec un aperçu et le ⋮ d'une catégorie ouverts ; iPad 820 clair ; la gestion des tampons avec la phrase ; le spécimen).
> **Pas de release, ni verdict complet, ni push, ni fusion.** La copie de travail revient sur `main` à la fin.

## 0. Ce que tu trouveras, en bref

1. La retouche du lot 4 : l'aide validée posée mot pour mot, « le ramène » vérifié dans les six fenêtres ; la Carte dit « de ce trimestre » ; le plan réécrit.
2. Les tampons en deux colonnes, avec les deux états calmes (la relation se lit par l'`id`).
3. **Deux corrections hors du code du lot, à juger (§ 6)** : « + Ajouter une catégorie » ne marchait plus ; « ← Utiliser » ne montrait le tampon qu'au chargement suivant de la page.
4. #1166 (l'image d'un tampon ramené se perd) et #1167 (§ 1.4) inscrites.
5. **À part, pour Grégoire (§ 7)** : les mots neufs, et l'aide qui reste fausse pour les tampons.

## 1. La retouche du lot 4 (`b481e947`)

| Point du verdict | Fait | Preuve |
|---|---|---|
| 2.1 L'aide, mot pour mot, « le ramène » | Les quatre sections du § 5.1, en `liste` titrées (la seule forme de section à titre ; « Deux colonnes » en deux items, « Les dossiers » en un). La section « Détection des doublons » d'avant part avec le reste. | Banc 1157 : un essai ouvre l'aide par le vrai bouton ⓘ de la fenêtre, lit le titre et deux phrases (dont « … le ramène. »), et vérifie que « badges de source », « ta sélection » et « Disponibles » sont partis. Break-test : « le ramène » → « en remet un exemplaire » : ROUGIT. |
| 2.2.1 « de ce trimestre » | La question : « Supprimer définitivement la carte « X » de ce trimestre ? » ; la notification : « Impossible de supprimer la dernière carte de ce trimestre. » | Banc 1157, les deux lues mot pour mot ; deux break-tests (retour à « du trimestre actif »), tous deux ROUGISSENT. |
| 2.2.2 La colonne vide | « … ou crée-la avec « Nouvelle carte », dans le menu « Actions ». » Le libellé à l'écran est « Actions ▾ » (`index.html`, `#planif-btn-actions`) : repris sans le ▾. | Lecture. Pas de banc, comme pour les autres phrases de colonne vide (un trimestre garde toujours une carte). |
| 2.3 Le plan | La livraison après le lot 6 ; les étapes de la mise en ligne réécrites pour le lot 6 ; lot 5 = tampons avec les mots validés et la phrase ; lot 6 = les trois listes simples, mots des cours validés ; « Hors du plan » : les tampons restent communs. | `PLAN-2026-10-24-bibliotheques-deux-colonnes.md`. |

**« le ramène » dans les autres fenêtres** (mesuré par lecture, pas par banc) :

| Fenêtre | Ce que fait « ← Utiliser » sur l'exemplaire d'un élément retiré |
|---|---|
| Grilles, échelles, cartouches | Retrouve l'élément retiré par `id` **ou `idOriginal`** et remet son drapeau : le ramène. |
| Pratiques | Même `id` des deux côtés ; la pratique retirée est réactivée (`existante.dansBibliotheque = true`) : la ramène. |
| Productions | **Nuance.** `ajouterProductionIndividuelle` ne cherche que par `id`. Une production gardée par « Garder → » (même `id`) est ramenée depuis son exemplaire. Une production venue de la bibliothèque (`idOriginal`) n'est pas trouvée : la garde d'identité #476 refuse alors la copie, avec « « X » est déjà dans ce trimestre. » (faux, elle est retirée), et rien ne change. Mais la production retirée a **sa propre rangée** dans « Dans ta bibliothèque » (« Retirée de ce trimestre · … »), dont le « ← Utiliser » la ramène bien (trouvée par son `id`). |

Aucune fenêtre ne crée de copie au lieu de remettre l'élément : **le texte est posé tel quel.** La nuance des productions (un message faux sur la rangée de l'exemplaire) est une trouvaille (§ 8).

## 2. Mesuré et supposé (lot 5)

| | Constat | Comment |
|---|---|---|
| Mesuré | La palette et la bibliothèque sont communes à tous les trimestres, et les deux passages gardent l'`id` (Cowork) : les deux états calmes se lisent par l'`id`. | Lecture de `partagerTampon` et `ajouterDepuisBibliotheque` ; banc : « Garder → » puis « ✓ Aussi… », « ← Utiliser » puis « ✓ Déjà… ». |
| Mesuré | « ✓ Déjà dans ta palette » reconnaît un tampon intégré : l'ensemble est celui d'avant (`tamponsPersonnalises` ∪ tous les tampons de l'application). | Banc : `obs-attention` gardé dit « ✓ Déjà dans ta palette ». Break-test : sans les tampons intégrés, ROUGIT. |
| Mesuré | **« + Ajouter une catégorie » levait une erreur et n'ajoutait rien** (WebKit : « The object can not be found here. »). `ajouterCategorieRetroObs` insérait avant `catContainer.querySelector('button')`, qui est le ⋮ de la première rangée depuis #267, et non un enfant direct. | Banc jetable, puis banc 1158 : le clic ajoute une rangée « Nouvelle catégorie », sans erreur de page. Break-test : l'ancien sélecteur remis : ROUGIT. Corrigé (§ 6.1). |
| Mesuré | **« ← Utiliser » écrivait le tampon dans `tamponsPersonnalises`, mais la palette ne le relisait qu'au chargement suivant** (`chargerTamponsPersonnalises` n'est appelé qu'au démarrage du module) : la colonne « Dans ta palette » et la palette d'Annoter restaient sans lui. | Banc jetable : `obtenirAutocollants()` sans le tampon après le geste. Corrigé (§ 6.2) ; banc 1158 : la colonne et la palette d'Annoter le montrent. Break-test : sans la relecture, ROUGIT. |
| Mesuré | Les jetons (« Jeton de délai », « Jeton de reprise », `categorie: 'jeton'`) ne sont pas dans la palette d'Annoter, mais l'ancienne fenêtre les listait sous un intertitre « jeton » (l'identifiant brut). | `js/travaux-outils.js` l. ~338 (« les exclut de la palette tampons ») ; capture jetable. Écart 2 (§ 5). |
| Mesuré | L'image d'un tampon de la palette est celle de la palette et de la copie : `obtenirImageAutocollant(id).getAttribute('src')` (un fichier du dossier `autocollants/`, ou l'image personnalisée en base64). | Banc : `autocollants/icons8-high-risk.svg`, chargée (`naturalWidth > 0`). |
| Supposé | « un rendu d'image déjà existant » (§ 1.3) : j'ai lu « la source d'image que la palette affiche déjà », et ajouté au composant une simple `<img>` dans l'aperçu (`apercu.image`), filtrée. Si la consigne voulait dire « sans rien ajouter au composant », l'aperçu retombe sur la description, et la plupart des tampons n'en auraient pas. | Écart 1 (§ 5). |
| Supposé | La description d'un exemplaire n'est montrée que si elle dit plus que le nom : `partagerTampon` pose `description_courte = nom`. | Lecture. |

## 3. § 1.4 : un tampon intégré, gardé puis « ← Utiliser »

**Oui, un doublon, mais dans les données seulement, et inatteignable depuis l'écran.** Banc jetable : `partagerTampon('obs-attention')` puis `ajouterDepuisBibliotheque('obs-attention')` : `tamponsPersonnalises` passe de `[]` à `['obs-attention']` ; la palette n'en montre qu'un (`chargerTamponsPersonnalises` saute un `id` connu). Depuis la fenêtre, le geste n'est pas offert : la rangée dit « ✓ Déjà dans ta palette » (l'ancienne fenêtre cachait « Ajouter » de même). **Inscrit : #1167.** Non corrigé.

## 4. La correspondance des gestes

| Avant | Maintenant | Action |
|---|---|---|
| « Partager » sur un tampon | « Garder dans ma bibliothèque → » ; ou « ✓ Aussi dans ta bibliothèque » | `partagerTampon` |
| « Ajouter » | « ← Utiliser dans ma palette » ; ou « ✓ Déjà dans ta palette » | `ajouterDepuisBibliotheque` (+ la relecture de la palette, § 6.2) |
| ⋮ d'un tampon : Exporter | ⋮ : « Exporter » | `exporterUnTampon` |
| ⋮ de la bibliothèque : Supprimer | ⋮ : « Supprimer de ma bibliothèque » (rouge) | `supprimerDeBibliotheque` (codex proposé, inchangé) |
| « Partager », « Exporter » sur l'intertitre d'une catégorie | ⋮ de l'intertitre (colonne de la palette) : « Tout garder dans ma bibliothèque », « Exporter » | `partagerCategorie`, `exporterCategorie` |
| « Importer un fichier JSON », « Exporter la bibliothèque », la phrase des droits | « Importer ou exporter ▾ » : « Importer des tampons », « Exporter ta bibliothèque », notes « Fichiers .json » et « Assure-toi d'avoir les droits sur les images importées. » | le même champ `#biblio-tampons-fichier-import`, `tamponsBiblioImporterFichier`, `exporterBibliotheque` |
| Étiquettes « Intégré », « Personnalisé », « Bibliothèque » ; ligne « catégorie · auteur · date » | « Intégré » en clair, rien pour un tampon à soi, « par <auteur> » si ce n'est pas l'utilisateur ; la catégorie est l'intertitre ; la date d'ajout part | — |
| Sous-titre « Partagez et réutilisez vos collections… » | parti | — |

Aucun geste perdu. « Tout garder » n'est offert que s'il reste un tampon de la catégorie hors de la bibliothèque (le patron de la condition des grilles) ; « Exporter » reste toujours.

## 5. Mes écarts

1. **Une image dans l'aperçu** (composant : `apercu.image`, `BibliothequeUI.sourceImageApercu`). Seules passent une image du dossier `autocollants/` (sans `..`, ni `:`, ni guillemet) ou une image `data:image/(png|jpeg|gif|webp);base64` : la source peut venir d'un fichier importé. Banc : une adresse `https://…` et un `../../index.html` n'affichent rien. L'image paraît **sur un carré blanc, dans les deux modes** (le papier d'une copie) : la palette, elle, l'inverse en mode sombre, ce qui fausserait une image personnelle en couleur. Le blanc est un `#fff` littéral, commenté (aucun jeton ne reste blanc en mode sombre).
2. **Les jetons sortent de « Dans ta palette »** : ils ne sont pas dans la palette, et la colonne le dit maintenant. Leurs deux gestes d'avant (« Partager », « Exporter » sur deux pseudo-tampons de texte) disparaissent avec eux. À refuser si un jeton doit pouvoir se garder.
3. **L'ordre des catégories** est celui de la palette (`obtenirOrdreCategories`), puis les catégories inconnues d'un import, en dernier ; avant, c'était l'ordre d'insertion.
4. **Le spécimen** de `design-system.html` (section 25) prend une seconde illustration : l'intertitre à ⋮ et l'image d'aperçu, dans les deux modes. Sans erreur de console (capture `specimen-categorie-tampons.png`).
5. Le geste du bouton de la palette n'est plus une bascule (il fermait la fenêtre si elle était ouverte) : la fenêtre recouvre la palette, le bouton n'est pas atteignable tant qu'elle est ouverte.

## 6. Deux corrections dans du code d'avant le lot (issue 1 : elles cassaient le parcours livré)

1. **« + Ajouter une catégorie »** (`js/travaux-outils.js`, `ajouterCategorieRetroObs`) : le sélecteur vise le bouton lui-même (`:scope > [data-action="travauxOutils.ajouterCategorieRetroObs"]`). Motif : la phrase validée de Grégoire invite à ce geste, et il ne faisait rien. La sauvegarde de la catégorie (`enregistrerRetroObservations`, qui lit `data-cat-perso-id`) n'est pas touchée.
2. **La palette relue après « ← Utiliser »** : `travauxOutils.rechargerTamponsPersonnalises()` (nouvelle, exportée) enchaîne `chargerTamponsPersonnalises`, `appliquerPersonnalisations` et `rafraichirPalettesApresPersonnalisation`, trois fonctions existantes, **sans rien écrire**. Motif : la preuve demandée (§ 3, « ← Utiliser » le remet dans la palette) ne tenait pas à l'écran.

L'écriture de `ajouterDepuisBibliotheque` n'a pas changé. Le tri des lignes du diff qui écrivent : `git show 39e1c202 -- js/ | grep -nE "^[+-].*(db\.(set|setSync|modifier|remove)|sauvegarder)"` → **aucune ligne** : aucune écriture ajoutée ni retirée.

## 7. À part, pour Grégoire

### 7.1 Les mots neufs de la fenêtre des tampons (codés)

| Mot | D'où il vient |
|---|---|
| « Dans ta palette », « Dans ta bibliothèque », « Garder dans ma bibliothèque → », « ← Utiliser dans ma palette » | validés (16 h 55) |
| « ✓ Aussi dans ta bibliothèque », « ✓ Déjà dans ta palette » | le patron (Cowork) |
| Les deux phrases de colonne | proposées par Cowork, **posées telles quelles** |
| « Tout garder dans ma bibliothèque », « Supprimer de ma bibliothèque », « Importer des tampons », « Exporter ta bibliothèque », « Fichiers .json » | la consigne |
| « Ta bibliothèque est vide. Garde-y un tampon de ta palette pour le retrouver plus tard. » | **neuf** : le patron des autres fenêtres (l'ancienne phrase renvoyait à « Partager ») |
| « Aucun tampon configuré. » (palette vide) | gardé d'avant ; presque jamais lu (les tampons intégrés) |
| Bulles (`title`) : « Garder toute la catégorie dans ta bibliothèque », « Exporter cette catégorie en JSON » | la première est neuve (l'ancienne disait « Ajouter toute la catégorie à la bibliothèque ») |

### 7.2 L'aide reste fausse pour les tampons

Le bouton ⓘ de la fenêtre des tampons mène, comme avant, à « Comment fonctionne la bibliothèque », qui parle de « Dans ce trimestre », de « Retirer » et des dossiers : rien de cela n'existe pour les tampons. **Non codé.** Deux voies : (a) une variante courte pour les tampons, que je peux proposer en mots ; (b) pas de ⓘ sur cette fenêtre. À Cowork et à Grégoire.

## 8. Les bancs

- **Banc neuf** `tests/integration/bibliotheque-deux-colonnes-1158.spec.js`, dans le vrai `index.html`, depuis la démonstration. La démo n'ayant aucune copie, le banc en pose une, fictive, ouvre Annoter et passe par le vrai bouton de la palette. 8 essais + les captures, à 1 440 et 820 px. **10 break-tests**, tous rougissent (liste en tête du fichier).
- **Banc 1157** : 1 essai de plus (l'aide), 2 assertions de plus ; 3 break-tests.
- **Bancs réancrés** : `grep -rlE "afficherBibliothequeTampons|modalBibliothequeTampons|tamponsBibliotheque\.|Mes tampons" tests/` → `lot-f-gestes-hors-temoin.spec.js` seul, qui appelle `ajouterALaBibliotheque` (fonction de données inchangée) : **pas de réancrage**, vert. `unit/sentinelle-467-affichage-echappe.test.js` : `tampons-bibliotheque.js` 4 → 0 interpolations nues, à la baisse, motif écrit ; break-test (une chaîne `'<span>' + t.nom +` remise) : ROUGIT.
- **Vitest** : 9 694 sur 9 695 ; le seul rouge est `sentinelle-anticache-fichiers-modifies` (`js/gabarits-utils.js`, connu, la release posera les `?v=`).
- **Playwright** (WebKit), 40 fichiers : les bancs des six autres fenêtres et ceux qui touchent une bibliothèque (`bibliotheque-deux-colonnes-1154` à `-1158`, `bibliotheques-*`, `doublons-*`, `repertoires-*`, `planif-barre-lot3`, `planif-toolbar`, `pratiques-compatibles-retirees`, `productions-biblio-ajout-identite`, `type-grille-lot1`, `cours-actif-hors-bibliotheque-916`, `diagnostic-doublons-lecture-seule`, `lot-f-gestes-hors-temoin`), et ceux de la palette d'Annoter (`annotation-*`, `palette*`, `codes-par-grille-palette`, `critere-algorithmique-palette`, `verrou-palette-annotation-1024`, `erreurs-palette-codes-fermee`, `erreurs-700-…`, `chrono-barre-annoter-937`, `liste-651-…`, `materiel-aide-accompagnement`) : **176 verts, 6 sautés** (les captures des autres lots), 0 rouge, 14,5 min. Lancé avant le commit, sur l'arbre de travail du lot ; une ligne de commentaire (#1166) a été posée pendant le passage. Le verdict complet suit la règle 7, après le lot 6.

## 9. Les trouvailles et leur issue

| Trouvaille | Issue |
|---|---|
| « + Ajouter une catégorie » levait une erreur depuis #267 | **Corrigée** (§ 6.1) : elle cassait la phrase livrée |
| « ← Utiliser » : le tampon n'entrait dans la palette qu'au chargement suivant | **Corrigée** (§ 6.2) : elle cassait la preuve du lot |
| « ← Utiliser » perd l'image : écrite dans `tamponsImages`, que rien ne lit ; la palette montre « ? » | **Inscrite : #1166** (corriger, c'est écrire ailleurs). Le stock déjà écrit chez les gens reste, c'est écrit dans la fiche. Commentaire posé dans `ajouterDepuisBibliotheque` |
| § 1.4 : doublon d'un tampon intégré dans `tamponsPersonnalises`, inatteignable depuis l'écran | **Inscrite : #1167** (consigne) |
| Productions : « ← Utiliser » sur l'exemplaire d'une production retirée venue de la bibliothèque dit « déjà dans ce trimestre », faux | **Commenter et oublier** (pas commenté dans le code : hors du lot) ; la rangée « Retirée de ce trimestre » la ramène. À Cowork d'en décider |
| « Tout garder » d'une catégorie dont une partie est déjà gardée : une notification d'erreur « Doublon » par tampon déjà gardé, en plus du compte (`ajouterALaBibliotheque`) | **Commenter et oublier** : vrai d'avant, sans conséquence sur les données |
| Les notifications des tampons disent « tampon(s) » | **Commenter et oublier** : fonctions de données d'avant, hors de la fenêtre |
