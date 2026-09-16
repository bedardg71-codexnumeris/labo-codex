# Audit — section « Exporter et archiver » (Évaluation, onglet 5)

**Date** : 16 septembre 2026, fin d'après-midi
**Demandé par** : Grégoire (« peux-tu faire un audit de la section "Exporter et archiver" ? »)
**Mode** : B (audit tiers, lecture seule). Aucun fichier du dépôt modifié ; banc jetable dans le scratchpad de la session ; `git status` propre après chaque mesure.
**État mesuré au départ** (rituel délégué) : HEAD `57d0c3f0` sur `main`, 1.142.16 commitée localement et **non poussée** ; Vitest 576 fichiers / 6448 verts ; verdict Playwright local périmé (SHA `cd78cba9`).

## Périmètre

| Pièce | Fichier | Lignes |
|---|---|---|
| Rendu de l'écran | `js/travaux-ui.js` → `afficherArchivage()` | 1248-1372 |
| Lanceurs de l'écran | `js/travaux-ui.js` → `lancerArchivage`, `lancerArchivageSemestre`, `lancerExportLea`, `mettreAJourCompteurLea`, `chargerQuota`, `proposerNettoyage` | 3590-3740 |
| Moteur ZIP / Léa | `js/travaux-archivage.js` | 849 lignes, entier |
| Aide lue par les testeurs | `index.html` (carte « Exporter et archiver les travaux », 11676-11710) ; `js/accompagnement-contenu-popup.js` (`archiver-travaux`, 511-535) ; `docs/modules/pipeline-annotation-evaluation.md` (§ Onglet 5) | |
| Tests existants | `sentinelle-565-export-lot-partiel`, `sentinelle-572-import-export-mineurs`, `sentinelle-568-569-exporter-design-tactile`, `travaux-export-pdf.test.js`, spec `carrousel-881-suppression-depuis-archivage` | |

Hors périmètre : le PDF de rétroaction lui-même (`synthese-retroaction-*`, audité le 25 août), l'archivage de trimestre (#622, moratoire), la Réserve.

## Ce que l'écran fait réellement (couture récit ↔ code)

Trois cartes, pas quatre : « Exporter des travaux » (filtres production + élève, ZIP plat par élève : originaux + annotés + `evaluations.json`), « Trimestre complet » (mêmes filtres, ZIP élève/production + `_evaluations.json` + `_resume.json`, DEFLATE, barre de progression), « Export Léa » (un PDF annoté + page de synthèse par élève, ZIP si plusieurs). Au-dessus, la grille des fichiers en stock avec une corbeille par vignette (#881 corrigé ce matin) ; en dessous, l'espace de stockage avec, au-delà de 70 %, un bouton « Proposer un nettoyage ». L'allègement a été retiré le 28 août.

## Constats

Niveau de preuve : **banc** = exécuté sur un banc jetable (`scratchpad/banc-export-travaux.mjs`, harnais `chargerScript` de la sentinelle 565) ; **grep** = mesuré par recherche ; **lecture** = relu, non exécuté.

| # | Constat | Gravité | Preuve | Disposition |
|---|---|---|---|---|
| C1 | « Télécharger » perd TOUT l'export sur un seul fichier illisible ; « Trimestre complet » et « Léa » survivent (#565 corrigé sur deux chemins sur trois) | 🟠 données | banc | **inscrit → #891** |
| C2 | Le nom du ZIP téléchargé n'est pas assaini : `travaux_Roy/Tremblay_Sam.zip` (#572 corrigé sur le chemin du profil, pas sur celui de l'écran) | 🟡 | banc | **inscrit → #891** |
| C3 | « Proposer un nettoyage » supprime DÉFINITIVEMENT la moitié la plus ancienne des fichiers du groupe, sans corbeille et sans vérifier qu'ils ont été exportés | 🟠 données | lecture | **inscrit → #892** |
| C4 | L'aide décrit un écran qui n'existe plus : « 4 modes », options « Inclure annotés / Inclure évaluations », « Allègement », titre « Archivage des travaux », import « via Annoter et évaluer » | 🟡 mots lus par les testeurs | grep | **inscrit → #893** |
| C5 | Statut « exporté » posé par une seule des trois cartes, et posé même sur un fichier dont le blob a été sauté ; ce statut fait taire la détection de blob manquant à l'import d'un codex | 🟡 données | lecture | **inscrit → #891** |
| C6 | Classe `.texte-muted` définie nulle part : 6 usages sur cet écran, 30 dans `travaux-ui.js`, 10 fichiers JS | 🟡 rendu | grep | **inscrit → #870 élargi** |
| C7 | Deux cartes font la même chose avec les mêmes filtres ; la première refuse son propre défaut (« Toutes / Tous » → alerte) | 🟡 produit | lecture | **inscrit → #895** (décision due) |
| C8 | Code mort : `exporterParProduction`, `lancerExportProduction`, `nettoyerProduction`, `lancerArchivageEtudiant`, `lancerArchivageProduction` (0 appelant) ; JSDoc de `exporterPourLea` collé à `selectionnerEvaluationsLea` | ⚪ dette | grep | **inscrit → #894** |
| C9 | Noms de dossiers de production : accents supprimés (« Écrit 1 » → `_crit_1`) alors que #572 les conserve pour les élèves ; `_assainirSegmentChemin` existe et n'est pas utilisée (3 sites) | ⚪ | banc | **inscrit → #891** |
| C10 | Microcopy du bloc quota sans accents et en jargon : « utilises », « Espace bientot plein », « liberera », « supprime(s) », « Mode: IndexedDB » | ⚪ mots | grep | **inscrit → #893** |
| C11 | `telechargerBlob` révoque l'URL dans le même tour que le clic ; deux autres modules attendent 1 s | ⚪ non vérifié | lecture | **refusé** (non vérifié, rouvrir sur symptôme) |

### C1 — un fichier illisible emporte l'archive entière (carte « Exporter des travaux »)

`exporterTravaux` (`travaux-archivage.js:185-236`) n'a aucun `try/catch` par fichier ; `exporterSemestre` (249) et `exporterPourLea` (413) en ont un depuis #565. Même trou sur `exporterParEtudiant` (73), appelé depuis le profil de l'élève (`profil-etudiant-sections-affichage.js:4358`).

Banc, trois copies dont une au blob illisible :

```
exporterTravaux: TOUT PERDU → Blob illisible
exporterSemestre: entrées = [ 'Tremblay_Alix_111/_crit_1/copie1.pdf', 'Gagnon_Noa_333/_crit_1/copie3.pdf', '_resume.json' ]
                  | échecs = [ 'Roy-Tremblay_Sam_222 / copie2.pdf — Blob illisible' ]
```

À l'écran : alerte « L'export a échoué : … » et rien de téléchargé, alors que les copies valides existent. Un PDF corrompu (`pdfjsLib.getDocument` rejette) produit le même effet par `genererFichierAnnote`. La sentinelle 565 ne couvre que `exporterPourLea` : c'est pour cela qu'elle est verte.

### C2 — le nom du ZIP téléchargé n'est pas assaini

`lancerExport` (`travaux-archivage.js:646`) construit `nomZip` avec `etudiant.nom + '_' + etudiant.prenom` bruts. #572 a assaini `lancerExportEtudiant` (chemin du profil, ligne 587) mais pas ce chemin, qui est celui du bouton de l'écran.

Banc : `DL: travaux_Roy/Tremblay_Sam.zip`. La sentinelle 572 teste la fonction pure, pas ce site d'appel.

### C3 — le nettoyage proposé par l'alerte de quota est une suppression définitive

`proposerNettoyage` (`travaux-ui.js:3703-3737`) trie les fichiers du groupe par date d'import, prend la moitié la plus ancienne, et après un `confirm` natif (« Assure-toi d'avoir archivé ces fichiers ») appelle `nettoyerFichiersArchives` → `supprimerFichierTravail` : blob, vignette et métadonnées effacés. Pas de passage par la corbeille (`corbeilleFichiers`), contrairement au bouton de suppression des vignettes du même écran. Aucun filtre sur `blobStatut === 'exporte'` : le nom de la fonction (« archives ») promet un tri qui n'a pas lieu. Les évaluations qui pointaient ces fichiers deviennent « sans fichier » pour l'export Léa.

Ce bouton n'apparaît qu'au-delà de 70 % du quota estimé. Pas de symptôme vécu connu. Le geste est irréversible sur les données de l'utilisateur : c'est ce qui justifie l'inscription malgré l'absence de symptôme.

### C4 — l'aide décrit un écran d'avant le 28 août

| Où | Ce qui est écrit | Ce qui existe |
|---|---|---|
| `index.html:11689-11700` | « 4 modes d'export : Par étudiant·e (ZIP), Par production (ZIP), Trimestre complet, Export Léa » | 3 cartes ; les deux premiers modes sont une seule carte à deux filtres |
| `index.html:11697-11700` | « Options d'export : Inclure annotés, Inclure évaluations » | aucune case à cocher ; annotés et évaluations partent toujours |
| `index.html:11702-11703` | « Allègement des fichiers : conversion en fac-similé (niveaux de gris, 800 px) » | retiré le 28 août 2026 (commentaire `travaux-ui.js:1271`) |
| `accompagnement-contenu-popup.js:512` | titre « Archivage des travaux » | l'écran s'appelle « Exporter et archiver » depuis #569 |
| `accompagnement-contenu-popup.js:530` | « tout ce qui a été importé via le panneau Annoter et évaluer » | l'import vit dans « Préparer et importer » (l'état vide de l'écran le dit correctement) |
| `docs/modules/pipeline-annotation-evaluation.md:165-205` | modes « Par étudiant / Par production », section « Allegement », cycle de vie avec `fac-simile` | idem |

Piège 8.2 du skill de vérification : la doc est une intention datée. Le texte de `index.html` est celui que les testeurs de la cohorte lisent.

### C5 — le statut « exporté » est posé de façon incohérente, et il a un lecteur qui compte

Qui écrit `blobStatut = 'exporte'` : `lancerExport` (carte 1) et `lancerExportEtudiant` (profil), sur TOUS les fichiers du filtre, y compris ceux que la boucle a sautés faute de blob (`if (!blob) continue;` puis `fichiers.forEach(marquerExporte)`). Qui ne l'écrit pas : « Trimestre complet » et « Léa ».

Qui le lit : les badges de l'écran (`travaux-ui.js:3133, 3199, 3489`) et surtout `import-export.js:1503` et `1548` — à l'import d'un codex, un fichier `'exporte'` n'attend légitimement pas de blob, et n'est jamais requalifié `'manquant'`. Un fichier au blob déjà absent, marqué « exporté » par la carte 1, disparaît donc du diagnostic d'import « partiel ». Source et stock : le correctif tarit la source ; le stock déjà marqué chez l'utilisateur reste tel quel, à assumer.

### C6 — `.texte-muted` n'existe pas

`styles.css` définit la variable `--texte-muted` (253, 516) et la classe `.u-texte-gris-clair` (708), jamais `.texte-muted`. Les 6 usages de l'écran (compte de fichiers en stock, description de chaque carte, compteur Léa, textes de progression) se rendent en couleur de texte normale. Même famille que #870 (six classes fantômes du profil), même remède : mesurer le rendu avant/après dans Chrome, dans les deux modes.

### C7 — deux cartes pour un même geste (décision produit)

« Exporter des travaux » et « Trimestre complet » offrent les mêmes deux filtres et exportent le même contenu (originaux + annotés + évaluations JSON). Différences : l'arborescence (`élève/fichier` contre `élève/production/fichier`), `_resume.json` et la compression pour la seconde, et la première **refuse son propre défaut** : « Toutes / Tous » est l'état initial des deux menus, et « Télécharger » répond alors « Sélectionne au moins un étudiant ou une production » (`travaux-ui.js:3595`), alors que la seconde carte accepte exactement ces valeurs. Deux lectures possibles : fusionner en une carte (le filtre « tout » donnant l'archive du trimestre), ou garder deux cartes et rendre la première explicite sur ce qu'elle exige. C'est un choix d'usage, pas de code.

### C8 — code mort et JSDoc détaché (`travaux-archivage.js`)

0 appelant hors du module, mesuré sur `js/`, `index.html`, `tests/` : `exporterParProduction` (126-183), `lancerExportProduction` (606-630), `nettoyerProduction` (812-826) ; dans `travaux-ui.js`, `lancerArchivageEtudiant` et `lancerArchivageProduction` (3603-3604, commentées « rétrocompatibilité », exportées 7428-7429, jamais câblées en `data-action`). Le bloc JSDoc de `exporterPourLea` (360-371) est collé à `selectionnerEvaluationsLea` depuis #566 (piège 8.5). Zéro-dette : retirer, pas conserver « au cas où ».

### C9 — noms de dossiers de production

`(production.titre || production.nom || '').replace(/[^a-zA-Z0-9]/g, '_')` à trois endroits (`exporterSemestre:289`, `lancerExport:651`, `exporterParProduction:137`) : « Écrit 1 » devient `_crit_1` (banc), « Été » deviendrait `_t_`. #572 a décidé de garder les accents pour les élèves (« un nom de dossier lu par un humain ») ; la même fonction `_assainirSegmentChemin` ferait le même travail ici.

### C10 — microcopy du bloc quota

`chargerQuota` (3674-3700) et `proposerNettoyage` : « utilises », « Espace bientot plein », « liberera », « supprime(s) », « Rafraichir », et « Mode: IndexedDB » / « Fichiers sur disque (FSAPI) » qui exposent des noms de technologie. Petit, mais sur le même écran que C4.

### C11 — révocation immédiate de l'URL de téléchargement (non vérifié)

`telechargerBlob` (561-568) appelle `URL.revokeObjectURL` juste après `a.click()`. `codex.js:3459` et `bilan-reflexif-import-export-texte.js:601` attendent 1 s. Aucun rapport testeur ne décrit un ZIP qui ne se télécharge pas ; je n'ai pas de Safari sous la main pour trancher. Refusé au BACKLOG faute de symptôme ; à rouvrir si un testeur iPad signale un téléchargement vide.

## Couverture de tests, telle qu'elle est

- Aucun test n'exécute `exporterTravaux` ni `exporterSemestre` : la 565 ne monte que `exporterPourLea`, la 572 teste deux fonctions pures et la présence textuelle des remises à zéro. C1 et C9 n'avaient donc aucune sentinelle pour rougir.
- `sentinelle-568-569` : `toBeGreaterThanOrEqual(8)` sur le compte de `controle-form` (piège 8.3 : retirer un select en laisse assez pour rester vert) ; les deux autres assertions sont textuelles et fidèles à l'état actuel.
- Le banc jetable de cet audit (≈ 30 lignes, harnais `chargerScript`) peut devenir la sentinelle de C1 tel quel : trois copies, une au blob illisible, attendre deux entrées et un échec nommé.

## Ce que l'audit n'a pas pu vérifier

- Rendu réel (C6, C10) : aucune mesure `getComputedStyle` dans le Chrome de Grégoire ; la classe absente est un fait, la différence visible est une inférence.
- Safari / iPad (C11) : non mesurable d'ici.
- L'export FSAPI (`recupererBlobFSAPI`) : non exercé par le banc, qui stubbe `recupererBlob`.
- Le stock chez les testeurs pour C5 (fichiers déjà marqués « exporté » à tort) : non mesurable, et de toute façon pas à réparer d'office.

## Dispositions — tranchées par Grégoire le 16 septembre 2026, soir : « on inscrit tout » (option 2)

Règle du 24 août : un item n'entre au BACKLOG que sur symptôme vécu ou blocage. Aucun de ces constats n'a été vécu. Deux sont pourtant proposés à l'inscription parce qu'ils touchent des données de l'utilisateur de façon irréversible (C3) ou font perdre un livrable entier (C1) ; les autres suivent un lot existant.

| Lot proposé | Constats | Taille estimée |
|---|---|---|
| A — « Télécharger » aussi robuste que « Trimestre complet » | C1, C2, C5, C9 | un `try/catch` par fichier + bilan #565, `_assainirSegmentChemin` sur 4 sites, marquage seulement des fichiers réellement exportés ; une sentinelle Vitest (banc de l'audit) |
| B — nettoyage de quota | C3 | passer par la corbeille, et ne proposer que les fichiers `exporte` |
| C — mots lus par les testeurs | C4, C10 | trois textes d'aide, six libellés |
| #870 élargi | C6 | mesure avant/après dans Chrome |
| famille #869 | C8 | ≈ 110 lignes retirées |
| décision | C7 | à trancher avant tout code sur la carte 1 |
| refusé | C11 | rouvrir sur symptôme |

**Inscrit** : #891 (lot A), #892 (lot B), #893 (lot C), #894 (code mort), #895 (décision C7), #870 élargi (C6). **Refusé** : C11. La ligne « Dernier ID » de `BACKLOG.md` passe à #895 dans le même commit que ce rapport.
