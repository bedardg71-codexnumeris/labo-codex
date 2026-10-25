# Demande de relecture – Les bibliothèques en deux colonnes, lot 6 : les trois listes simples, puis le retrait (#1159)

> Claude Code, dimanche 25 octobre 2026, soir, sur la branche `bibliotheques-deux-colonnes`, code en `cfc911c8` (consigne `CONSIGNE-LOT-2026-10-25-bibliotheques-deux-colonnes-6.md`, commitée seule en `3b095496`). Rien n'est fusionné, publié ni poussé : les étapes 3 à 5 du plan suivent ton verdict et les Nouvelles validées, au signal de Grégoire.

## 0. En bref

- Les cours, les trimestres et les groupes-cours s'ouvrent dans une **fenêtre à une seule liste**, avec un groupe replié en bas (« Mis de côté (n) », « Clos (n) »). Le composant : `BibliothequeUI.creerFenetreListe`, une fonction sœur qui réutilise le rendu des rangées des deux colonnes (`_renderRangee`). Les sept fenêtres déjà migrées ne reçoivent rien de neuf : leurs cinq bancs sont verts sans retouche (§ 4).
- Tous les mots validés sont posés mot pour mot ; aucun ne s'est révélé faux à la mesure. Deux mots neufs non validés, dits au § 5.
- **Le retrait** : `creerModal`, `renderCarteSelection`, `renderCarteDisponible`, leur bouton principal, `tronquerDescription`, le CSS des cartes et de l'intertitre de section, la règle des boutons des anciennes modales, le spécimen de la section 24 de `design-system.html` (remplacé par celui de la liste). `grep` nul, une sentinelle neuve le tient (§ 3).
- Le brouillon des Nouvelles pour les dix fenêtres est au § 7, **non codé**, pour Grégoire.

## 1. Mesuré et supposé

**Mesuré.**
- « Déposer dans les cours disponibles » (`partagerCours`) écrivait **davantage** que « Retirer de ma sélection » (`retirerCoursDeBibliotheque`) : il ouvrait la fenêtre des métadonnées Creative Commons, puis écrivait `metadata_cc` sur la fiche, en plus de `dansBibliotheque = false` et `actif = false`. Voir § 2.
- `retirerCoursDeBibliotheque` et `ajouterCoursIndividuel` **fermaient** la fenêtre sans la rouvrir : « Mettre de côté » n'aurait rien montré. Ils la redessinent maintenant, si elle est ouverte (`rafraichirBibliothequeCours`, même geste que les trimestres) ; fermée, elle reste fermée (`lot-f-gestes-hors-temoin` appelle `retirerCoursDeBibliotheque` sans fenêtre : vert).
- L'aide « Comment fonctionne la bibliothèque » décrit **deux colonnes** (texte validé du lot 4). Les trois listes simples n'en ont pas : elles n'ont plus de bouton ⓘ (écart, § 6).
- `[id^="modalBibliotheque"]:not(.biblio2-voile)` n'avait plus de lecteur : toutes les fenêtres de bibliothèque portent `biblio2-voile`. Retirée.

**Supposé.**
- La ligne d'un trimestre clos dit « Clos » (le mot d'avant) ; la consigne ne nommait que « Actif » et « Ouvert ».
- La compétence d'un cours, que la carte montrait tronquée, passe dans l'aperçu de la rangée (le nom devient le bouton qui le déplie, comme dans les sept autres fenêtres). Sans compétence, pas d'aperçu.
- Les bulles qui disaient « dropdown » (« Afficher dans le dropdown », « Masquer du dropdown ») sont **retirées**, pas réécrites : le libellé du bouton dit le geste, et une bulle neuve serait un mot non validé. Même chose pour les deux bulles des cours qui nommaient les anciennes sections (« … rejoint « Cours disponibles à ajouter » », « Ajouter ce cours à ta sélection »).

## 2. « Mettre de côté » des cours (§ 1 de la consigne)

Il prend **l'action de « Retirer de ma sélection »** : `dansBibliotheque = false`, `actif = false`. « Déposer dans les cours disponibles » écrivait en plus, sur la fiche, **les métadonnées Creative Commons** saisies dans sa fenêtre (`metadata_cc`) ; **plus rien ne les écrit**. `partagerCours` n'a plus d'appelant : il est retiré (zéro dette), avec son entrée `window`. Aucune donnée déjà écrite n'est touchée : une fiche qui porte `metadata_cc` le garde, et « Exporter » (`exporterUnCours`) continue de demander ses métadonnées au moment d'exporter.

La correspondance des gestes des cours :

| Avant | Maintenant | Action |
|---|---|---|
| « Reprendre dans ce trimestre » | inchangé, bouton de la rangée | `reprendreCoursDansTrimestreActif` |
| ⋮ « Exporter » | inchangé | `exporterUnCours` |
| ⋮ « Déposer dans les cours disponibles » et « Retirer de ma sélection » | ⋮ « Mettre de côté » | `retirerCoursDeBibliotheque` |
| ⋮ « Supprimer la fiche » (deux sections) | inchangé (la liste et « Mis de côté ») | `supprimerFicheCours` |
| « Ajouter à ma sélection » | « Remettre dans mes cours », bouton de la rangée mise de côté | `ajouterCoursIndividuel` |
| « Exporter tous mes cours » (sous la liste) | « Importer ou exporter ▾ » de l'en-tête | `partagerTousLesCours` |
| « Importer des cours » (sous les disponibles, **seulement s'il y en avait**) | « Importer ou exporter ▾ », toujours | `ouvrirFilePickerImportCours`, `importerCoursSimple` |

Le dernier rang répare en passant un geste caché : on ne pouvait importer des cours que si au moins une fiche était hors sélection.

## 3. Le retrait, chiffré

| Retiré | Où | Preuve |
|---|---|---|
| `creerModal`, `renderCarteSelection`, `renderCarteDisponible`, `_renderBoutonPrincipal`, `tronquerDescription` | `js/bibliotheque-ui.js` (−285 lignes nettes avec l'ajout) | `grep` : aucun appel, aucune définition dans `js/`, `index.html`, `design-system.html`, `tests/` ; seuls des commentaires d'histoire les nomment |
| `.biblio-carte`, `--selection`, `--disponible`, `-contenu`, `-titre`, `-meta`, `-inspire`, `-desc`, `-deja`, `-actions`, `-actions--vertical`, `.biblio-section-titre`, la règle des boutons `[id^="modalBibliotheque"]:not(.biblio2-voile)` | `styles.css` (−97 lignes, +10 pour la liste) | `grep` nul ; **reste `.biblio-carte--pointee`**, que « Voir » (bandeau des doublons) pose sur une rangée |
| La section 24 « Carte bibliothèque » | `design-system.html` | remplacée par « 24. Fenêtre de bibliothèque à une seule liste » (spécimen statique, deux modes, noms fictifs) |
| `partagerCours` | `js/cours.js` | § 2 |
| L'écouteur d'Échap propre aux groupes-cours | `js/trimestre-v2-groupes-cours.js` | le composant ferme sa fenêtre à Échap (banc, « Échap ferme ») |
| Les doublures de ces fonctions dans six fichiers de tests | `refactor-trimestre-v2`, `refactor-productions`, `452`, `390`, `449`, `partage-section-P4` | elles simulaient des fonctions qui n'existent plus |

**La sentinelle** `tests/unit/sentinelle-bibliotheques-liste-1159.test.js` : un détecteur sur le code sans commentaires de `js/`, `styles.css`, `index.html`, `design-system.html` et `tests/` ; un **témoin** qui prouve qu'il voit un appel restant, un mock restant, une classe restante, et qu'il laisse `--pointee` et l'histoire. Break-tests : un `BibliothequeUI.creerModal({…})` ajouté à `cours.js` → ROUGIT ; `.biblio-carte-meta {…}` ajouté à `styles.css` → ROUGIT.

**Les cliquets.**
- **#467 descend de deux** : les interpolations nues de `bibliotheque-ui.js`, 23 → 21 (`classeItem` de `renderCarteDisponible`, `fermerAttr` de `creerModal`) ; et la seule interpolation brute admise du fichier (`+ config.titre +`, le titre de `creerModal`) est partie : la liste des admises de ce fichier est vide.
- **#679 monte de un, et je le dis** : 292 → 293 couples. `biblio2-voile` n'avait pour seule règle CSS que le sélecteur mort `:not(.biblio2-voile)` que je retire. C'est un **crochet** (lu par `fermerModal` et par la fermeture à Échap), pas une classe muette : le compte des muettes ne bouge pas (103). Aucune des classes retirées n'était dans la liste (elles avaient toutes leur règle) : le retrait ne pouvait pas faire descendre ce cliquet.

## 4. La preuve

- **Banc neuf** `tests/integration/bibliotheque-liste-1159.spec.js`, dans le vrai `index.html`, depuis la démonstration, par le vrai bouton « Consulter la bibliothèque » du Cadre, à 1440 et 820 px : **14/14** (et l'essai des captures). Les mots mot pour mot ; chaque geste de la rangée et de ⋮ avec son action et son paramètre ; « Mettre de côté » puis « Remettre… » (cours et groupes-cours) avec le compte, l'écriture en base et le repli qui reste ouvert au redessin ; le trimestre actif sans bouton ni ⋮ ; aucune trace de « dropdown » dans tout le HTML de la fenêtre ; un nom de trimestre hostile affiché en texte ; pas de défilement horizontal, cibles de 44 px, Échap ferme. **Sept break-tests, sept rouges** (en-tête du banc), fichiers remis à l'identique (`cmp`) ; un huitième après les captures (ligne suivante).
- **Trouvé sur les captures, corrigé** : l'intitulé du groupe replié se lisait « Mis de côté(1) », sans espace (il est en `flex`, l'espace entre ses deux enfants tombait ; le `textContent` du banc, lui, la gardait). Titre et compte sont maintenant dans une seule boîte ; le banc mesure l'intitulé au rendu (`innerText`) ; break-test : la boîte retirée → ROUGIT. Et la capture des trimestres montrait le nom hostile du banc : l'essai des captures pose un nom ordinaire. Banc rejoué : 14/14.
- **Vitest** : 9 695 verts sur 9 696 ; le seul rouge est l'anticache de `js/gabarits-utils.js` (`?v=20261025a`), présent depuis le lot 1 et déjà relevé par l'audit de début de session, qui se résorbe à la release. Les jetons `?v=` des cinq fichiers de ce lot sont bumpés.
- **Specs des trois fenêtres** (`1007`, `1028`, `1147`, `1148`, `clore-et-alleger`, `e1`, `e2`, `e3`, `trimestres-1018`, `cours-refonte-rendu`, `lot-f-gestes-hors-temoin`, `cours-actif-hors-bibliotheque-916`) : premier passage **47 verts, 9 rouges**, tous attendus (§ 4.1) ; après réancrage, rejoués avec les bancs des sept autres fenêtres (ligne suivante) : tous verts.
- **Les bancs des sept autres fenêtres** (`bibliotheque-deux-colonnes-1154` à `-1158`), sans retouche, dans la même course que les specs réancrées : **73 verts, 5 sautés (les essais de captures), 1 instable** : « « Garder → » met le tampon… » (`-1158`), vert au second essai, puis **vert trois fois sur trois** rejoué seul. Cause probable, à dire : j'ai bumpé les jetons `?v=` d'`index.html` pendant cette course (le piège que le skill `portes-terrain` nomme, § 0).
- Pas de suite Playwright complète (consigne, § 5) : elle se prend sur `main` fusionné.

### 4.1 Les bancs réancrés, et leur motif

| Banc | Motif |
|---|---|
| `e1-archiver-trimestre`, `e3-renvoyer-trimestre`, `1028-archiver-copies`, `clore-et-alleger-un-trimestre` (specs) | Le trimestre clos est rangé sous « Clos (n) », replié : le banc l'ouvre par son intitulé avant d'agir (helper `ouvrirClos`, sans effet s'il est déjà ouvert). Rien d'autre ne change ; l'identifiant du ⋮ (`biblio-menu-<id>`) est gardé par le composant pour une liste unique. |
| `trimestres-1018-clore-pas-sur-l-actif` (spec) | « Trimestre actuellement actif » → la ligne de la rangée dit « Actif ». |
| `sentinelle-1002-mots-clos` | « Trimestres clos » → le groupe replié « Clos » et la ligne « Clos ». |
| `sentinelle-1037-…-sans-dialogues-natifs` | `primaire = { label: 'Rouvrir'…` → `passage = …` ; la doublure redessine par `creerFenetreListe`. |
| `sentinelle-1148` (rangée du Cadre) | Le sous-titre des groupes-cours : la phrase validée le 25 oct. |
| `sentinelle-386` (échappement) | Le nom d'une rangée passe en texte, le composant l'échappe ; le banc neuf l'éprouve avec un nom hostile. |
| `sentinelle-291` (puce d'id, ancre, CT-29) | Les promesses des cartes rejouées sur les rangées de la liste (puce opt-in, ancre dans les deux groupes, id hostile, `param2` hostile du bouton). Break-test : `echapperAttribut` retiré de l'ancre → ROUGIT. |
| `sentinelle-458` (fiche au champ absent) | Le banc lit les rangées des deux groupes passées à `creerFenetreListe` : absent → la liste, `false` → « Mis de côté ». |
| `sentinelle-468` (boutons qui mentent) | « Déposer » parti : le test joue « Mettre de côté » (pas de `metadata_cc`, pas de téléchargement, `partagerCours` absent) ; le ⋮ offre « Exporter » et « Mettre de côté ». |
| `sentinelle-449` (suppression de fiche) | Le réversible s'appelle « Mettre de côté », non rouge ; deux « Supprimer la fiche ». |
| `sentinelle-522-lot5b` | A.b, B.a (volet « déposer ») et le site `partagerCours` retirés avec la fonction ; huit sites au lieu de neuf. |
| `sentinelle-678` | B.a (« partager un cours introuvable ») retiré avec la fonction. |
| `sentinelle-lot-F-gestes-hors-temoin` | `cours.js` : 5 → 4 annonces (celle de `partagerCours`). |
| `sentinelle-etiquettes-nature-un-point-unique` | `cours.js` : 2 → 1 lecture du point unique (un seul `nomCours` pour les deux groupes). |
| `sentinelle-381` | La doublure de `BibliothequeUI` offre `creerFenetreListe`. |
| `sentinelle-679` (fixture) | `biblio2-voile` inscrit comme crochet (§ 3). |
| `sentinelle-467` | À la baisse (§ 3). |

## 5. Les mots neufs non validés (pour Grégoire)

- **« Aucun cours pour l'instant. »** : la phrase de la liste des cours vide (elle ne paraît que si tous les cours sont mis de côté). L'ancienne, « Aucun cours dans ta sélection », nommait une section qui n'existe plus.
- Les **notifications** des deux gestes des cours gardent leurs mots d'avant : « Cours retiré de ta sélection », « Cours ajouté à ta sélection avec succès ! » ; celle des groupes-cours : « Groupe-cours masqué ». La consigne ne les couvrait pas ; je n'en ai pas inventé. Propositions, si Grégoire le veut : « Cours mis de côté. », « Cours remis dans tes cours. », « Groupe-cours mis de côté. »

## 6. Mes écarts

- **Pas de bouton ⓘ sur les trois listes** (il y en avait un sur l'ancienne modale) : l'aide validée décrit deux colonnes, elle serait fausse ici. Une aide propre aux listes serait un texte neuf.
- **La fenêtre redessinée** après « Mettre de côté » et « Remettre dans mes cours » (§ 1) : c'est le même geste de données ; seule la fenêtre reste ouverte au lieu de se fermer.
- **Un séparateur** avant « Supprimer… » / « Supprimer la fiche » / « Supprimer » dans les ⋮, comme dans les sept autres fenêtres.
- **#679 monte de un** au lieu de descendre (§ 3).

## 7. Le brouillon des Nouvelles, pour les dix fenêtres (proposé, PAS codé, pour Grégoire)

```
{ version: '1.218', couleur: 'vert', titre: 'Les bibliothèques, plus simples', items: [
  'Conception : les six bibliothèques (grilles, échelles, cartouches, productions, pratiques, cartes d’alignement) s’ouvrent en deux colonnes, « Dans ce trimestre » à gauche et « Dans ta bibliothèque » à droite. Sur l’iPad en portrait, elles s’empilent.',
  'Un seul bouton par rangée fait passer un élément d’une colonne à l’autre : « Garder dans ma bibliothèque → » ou « ← Utiliser dans ce trimestre ». Une coche te dit quand il est déjà de l’autre côté. Les autres gestes sont dans le menu ⋮.',
  'Touche le nom d’un élément pour voir ce qu’il contient, sans quitter la fenêtre.',
  'Tes tampons ont la même fenêtre : « Dans ta palette » et « Dans ta bibliothèque », rangés par catégorie.',
  'Cours, trimestres et groupes-cours (Réglages › Cadre) : une seule liste, « Actif » écrit en clair. Ce que tu mets de côté se range en bas, sous « Mis de côté » (« Clos » pour les trimestres), replié.',
  '« Supprimer définitivement » efface l’élément de ce trimestre, mais garde son exemplaire de ta bibliothèque, et te le dit avant.',
  'Les fichiers sont réunis dans « Importer ou exporter ▾ », en haut de chaque fenêtre.',
  'Carte d’alignement : « Partager » s’appelle maintenant « Garder dans ma bibliothèque → ».'
] }
```

Le numéro `1.218` est supposé (une `minor` après la 1.217) ; la release le fixera. Huit items (le skill en demande 6 à 8). Le titre change (« Les bibliothèques, plus simples ») parce que trois des dix fenêtres n'ont pas deux colonnes ; l'ancien reste possible.

## 8. Les trouvailles et leur issue

| Trouvaille | Issue |
|---|---|
| `partagerTousLesCours` (« Exporter tous mes cours ») n'exporte que `dansBibliotheque === true` : une fiche au drapeau absent (#458) serait dans la liste mais pas dans le fichier. Aucune fiche ne reste sans drapeau après la migration de démarrage. | **3, commenter et oublier** (pas de symptôme vécu ; aucun commentaire ajouté au code faute de place sans élargir le lot : je le laisse ici) |
| `BibliothequeUI.formaterMetadonnees` n'a aucun appelant dans `js/` (seulement des tests et l'ancien spécimen) ; `genererBadgeSourceProduction` (`productions.js`) non plus. Morts **avant** ce lot, pas lus par les cartes. | **2, inscrire et continuer** : à verser par Cowork s'il juge qu'ils méritent une fiche (la règle du BACKLOG demande un symptôme vécu ; ils n'en ont pas) |
| La branche `onclick` héritée de `_btnAttrs` (`onclickToDataAttrs`) : plus aucun appelant ne passe `onclick`, et elle n'échappe pas ses paramètres. Code mort, sans exposition aujourd'hui. | **2, inscrire et continuer** (même réserve) |
| La démonstration a une fiche de cours sans code ni nom : sa rangée s'appelle « - » (l'ancienne carte affichait la même chose). | **3, commenter et oublier** (données de démonstration, rien chez Grégoire) |
| GitHub rouge sur `main` (1.217.0, 32 specs, Linux), relevé par l'audit de début de session ; sans lien avec ce lot. | **2, inscrire et continuer** : à rapprocher de #1114 à #1116 au moment de la fusion |
