# Inventaire des écritures directes hors témoin commun

Branche `lot-f-les-mots`, HEAD `1393e54a`, 2026-09-29. Lecture seule : aucun fichier du dépôt n'a été modifié.

Recherche : `git grep -n -E "db\.(setSync|set|modifier|removeSync|remove)\(" -- 'js/*.js'`, sans `js/db.js` ni `js/modes.js` → **540 lignes**. Sur ce total, 9 ne sont pas des écritures (commentaires ou code commenté) ; il reste **531 sites réels**. Les déclencheurs ont été remontés par grep (nom de la fonction, `data-action`, `data-on-change`, `addEventListener`). Pour situer chaque ligne dans sa fonction, j'ai utilisé l'analyseur acorn.

## Décompte

| catégorie | sites | ce que c'est |
|---|---|---|
| G, geste vivant | 165 | à raccorder |
| G, code mort | 34 | geste sans déclencheur vivant (exporté jamais câblé, ou DOM absent d'`index.html`) : rien à raccorder aujourd'hui |
| C | 14 | déjà couvert par le même geste |
| M | 202 | boot, migration, recalcul, cache, démo, écriture à la lecture |
| A | 59 | état d'affichage, contexte actif, préférences d'interface |
| X | 53 | codex (`_codex_*`), import d'archive, Réserve, suppression de trimestre |
| Z | 4 | archivage et désarchivage dans `trimestres.js` (tous Z/G) ; `trimestre-v2-liste.js` n'a aucun site direct |
| — | 9 | pas une écriture |
| **total** | **540** | |

Point d'appui qui compte (fait) : le codex compte **toutes** les clés sauf celles en `_codex_` (codex.js:314, 405). Même une clé A fait donc partie du fichier. Classer une écriture en A revient à décider qu'elle n'a pas besoin de dire « pas à jour ». Ce n'est pas la même chose que « hors codex ».

## Où raccorder les sites G : un appel par geste ou par point de passage

J'ai préféré un **point de passage unique** quand une seule fonction porte plusieurs gestes. Sinon, la fonction du geste, juste après l'écriture réussie. Quand ce point unique a aussi des appelants machine, il faut une option `discret` (ou l'équivalent) pour eux. Chaque cas est signalé.

| # | geste(s) | endroit proposé | sites couverts | mixte ? |
|---|---|---|---|---|
| 1 | Annoter une copie (minuterie après chaque trait, changement de page, fermeture) | travaux-annotation.js:3239, juste après `travauxStockage.sauvegarderAnnotationFichier(annotationCourante)` dans `sauvegarderAnnotation` | travaux-stockage.js:894 (chemin annotation) | non |
| 2 | Tous les gestes sur les copies : import, réimport, doublons à l'import, renommer, propriétés, réassigner, transfert, corbeille, restaurer, rognage/édition, nettoyage des doublons | dans `sauvegarderFichiersTravaux` (travaux-stockage.js:292) et `sauvegarderCorbeille` (:944), après le `setSync` | travaux-stockage.js:292, 944 (+894 via `supprimerAnnotationsFichiers`) | **oui** : `migrerBlobStatut`, `purgerCorbeilleExpiree`, `_migrerThumbnailsVersIDB` passeront discret ; `marquerExporte` est à trancher |
| 3 | Valider des doublons | travaux-doublons-ui.js:36 (`_enregistrerValidations`) | 1 | non |
| 4 | Enregistrer / réinitialiser les tampons, importer un fichier de tampons | fin de `enregistrerRetroObservations`, `reinitialiserRetroObservations`, `confirmerImportTampons` (travaux-outils.js) | 708, 725, 740, 749, 758, 767, 798, 1007, 2927, 2938, 2994, 3012-3030, 3506, 3527, 3528 | non |
| 5 | Enregistrer / réinitialiser les rétroactions d'erreurs de français | fin de `enregistrerRetroErreursFr`, `reinitialiserRetroErreursFr` | 712, 1128, 1136, 3735-3737 | non |
| 6 | Mode de synthèse FR, raccourcis clavier | travaux-outils.js:3843 et :1236 | 2 | à trancher (réglages) |
| 7 | Bibliothèque de tampons : partager, supprimer, importer, partager une catégorie ; ajouter depuis la bibliothèque | tampons-bibliotheque.js:31 (`sauvegarder`) ; fin d'`ajouterDepuisBibliotheque` (:167) | 3 | non |
| 8 | Modélisation : ouvrir un fichier local, supprimer | modelisation.js:238 (`sauvegarderFichiers`) ; la suppression (:432) appelle déjà `sauvegarderFichiers` après | 2 | non |
| 9 | Carte d'alignement : chaque édition, créer/renommer/supprimer/dupliquer/importer une carte, cours de la carte, bibliothèque | planification-donnees.js:147 (`setDonnees`) | 147 + 576 (même geste d'import) + planification-carte.js:3742 (suppression d'un nœud, déjà suivie de `sauvegarder()`) | **oui** : `initialiserSiNecessaire`, `migrerDonneesProto` passeront discret ; `changerCarte` (onglet de carte) aussi |
| 10 | Bibliothèque d'alignements | planification-bibliotheque.js:42 (`sauvegarderBibliotheque`) | 1 | non |
| 11 | Bilan réflexif : éditer le questionnaire, le parcours ; importer, supprimer les résultats | bilan-reflexif-core.js:320 et :324 ; bilan-reflexif-csv.js:577 ; bilan-reflexif-rapport.js:661 | 4 | non |
| 12 | Cocher un artefact du portfolio | portfolio.js:431 | 1 | non |
| 13 | Registre longitudinal : ajouter/retirer un résultat, retirer un élève, inscrire | registre-longitudinal.js:408, 421, 449, 584 | 4 | non |
| 14 | Tirage et banque de questions | boite-outils.js:40 (`sauvegarderEtatTirage`) et :508 (`sauvegarderEtatQuestions`) | 2 | **oui** : les appels d'`initialiserTirage` (l. 88, 147) passeront discret |
| 15 | Élèves suivis : ajouter, retirer, vider | tableau-bord-apercu.js:175 (`sauvegarderEtudiantsSuivis`) | 1 | non |
| 16 | Verrouiller une date de présences | saisie-presences.js:871 | 1 | non |
| 17 | Supprimer, masquer, afficher un groupe-cours | fin de `supprimerGroupeCoursV2`, `supprimerGroupeCoursDepuisBibliotheque`, `masquerGroupeCoursDepuisBibliotheque`, `afficherGroupeCoursDepuisBibliotheque` | 10 | masquer/afficher : à trancher |
| 18 | Supprimer une séance, supprimer un horaire (V2) | fin de `supprimerSeanceV2` (:473) et `supprimerHoraireV2` (:1084) | 4 | non |
| 19 | Cours (bibliothèque) : retirer, supprimer avec garde, ajouter, importer, déposer | cours.js:396, 543, 572, 698, 768 | 7 | non |
| 20 | « Créer mon service » (Rencontres) | fin de `creerMonService` (rencontres.js, après :413) | 4 + l'appel de `creerTrimestre` + `CoursEntite.creer` | non |
| 21 | Créer un trimestre (liste des trimestres) | **dans** `creerTrimestre` (trimestres.js:534, après le `setSync`) : ça couvre trimestre-v2-liste sans toucher au fichier sous moratoire | 1 | non |
| 22 | Export « format recherche » | trimestres.js:2402 | 1 | à trancher |
| 23 | Productions : typer, monter/descendre, supprimer (×3 chemins), dupliquer, ajouter/retirer de la sélection, importer (fichier, trimestre), migration des catégories | après le `db.modifier` de chaque fonction : productions.js:473, 2396, 2435, 3418 ; productions-liste.js:327, 408 ; productions-bibliotheque-ui.js:293, 664, 714 ; productions-bibliotheque.js:88 ; productions-import-export.js:434, 616 | 12 (+135 dans le même geste que la suppression) | non |
| 24 | Grilles, échelles, cartouches : ajouter/retirer de la sélection, supprimer, importer (fichier, trimestre), copier depuis un trimestre | après le `db.modifier` de chaque fonction (voir §13) ; pour la **suppression depuis l'écran Données**, un seul appel dans `confirmerSuppressionRessource` (donnees-v2.js), sous `if (succes)`, couvre donnees-v2:1689/1707/1727/1776, main.js:143 et les `retirer…DeLaBibliotheque` | environ 25 | non |
| 25 | Dupliquer (grille, échelle, cartouche, pratique, production) | `BibliothequeUI.dupliquerEtEditerItem` et `dupliquerVersBibliotheque` (bibliotheque-ui.js:513 et 581), après `await d.modifierListe(...)` | 11 | non |
| 26 | Dossiers de classement | repertoires-bibliotheque.js:33 (`_ecrire`) | 1 | non |
| 27 | Copier depuis le partage, retirer du partage | partage-section.js:96 (`ecrire`) | 1 | non |
| 28 | Importer un paquet partagé | fin d'`integrerPackage` (partage-import.js, après :282) | 1 | non |
| 29 | Métadonnées CC | cc-license.js:1480 | 1 | non |
| 30 | Paramètre de config supprimé (écran Données) | donnees-v2.js:889 | 1 | non |
| 31 | Jugement de dénotation | denotation-jugements.js:125, ou `denotationSaisie.enregistrer` sous `if (ok)` | 1 | non |
| 32 | Modalités d'évaluation (objectifs, grille de conversion, types de travaux) | modalites-evaluation.js:49 (`_ecrire`) | 1 | **oui** : `chargerConfigParObjectifs` (ouverture), démo et import-export passeront discret |
| 33 | Pratiques : pratique active du groupe-cours, par défaut, dupliquer, supprimer, adopter une maquette, ajouter/retirer de la sélection, supprimer hors bibliothèque, copier depuis un trimestre, importer, enregistrer la config dans la bibliothèque, retirer de la bibliothèque partagée | pratique-manager.js:84, 208, 233 ; pratiques.js:309, 1028, 1474, 1503, 1569 ; pratiques-gestion.js:665, 853, 937, 981, 2469 ; pratiques-bibliotheque.js:362, 434 | 16 | `sauvegarderPratique` (:208) : `importerPratique` et `initialiserPratiquesPredefines` passeront discret |
| 34 | Ensembles d'objectifs | objectifs.js:58 (`sauvegarderEnsemblesObjectifs`) | 1 | non |
| 35 | Réinitialiser les seuils d'interprétation | interpretation-config.js:174 | 1 | non |
| 36 | Notes du rapport (saisie libre) | profil-etudiant-rapport.js:460 | 1 | non |

À côté du tableau (fait) : aucun des modules suivants n'appelle aujourd'hui le témoin commun, même une fois : rencontres, productions-liste, productions-bibliotheque(-ui), productions-import-export, cartouches-bibliotheque, grilles-bibliotheque, echelles-bibliotheque, pratiques-bibliotheque, portfolio, registre-longitudinal, boite-outils, bilan-reflexif (sauf une ligne dans core), planification-*, travaux-stockage, travaux-outils, tampons-bibliotheque, cours, objectifs, modelisation.

## À trancher

| site(s) | question | ma lecture (inférence) |
|---|---|---|
| boite-outils.js:40, 508 (tirage) | L'état du tirage (qui a été tiré, exclusions), c'est une donnée ou de l'affichage ? | G pour les questions saisies (contenu) ; l'état de tirage penche vers A |
| trimestre-v2-orchestre.js (9 sites), trimestres.js:560-578, trimestre-v2-cours.js:586-587, contexte.js | Changer de groupe-cours, de cours ou de trimestre actif écrit aussi `groupesCours[].actif`, `cours[].actif`, `trimestres[].actif` | A : c'est le contexte d'affichage, et la donnée pédagogique reste la même |
| trimestre-v2-groupes-cours.js:1093-1128 | Masquer ou afficher un groupe-cours dans la barre (`dansSidebar`) | A de nature, mais écrit dans la collection `groupesCours` |
| travaux-stockage `marquerExporte` | Le drapeau « exporté » posé par un export PDF ou une archive | M : c'est un effet de bord de l'export |
| travaux-outils.js:3843, 1236 | Mode de synthèse FR, raccourcis clavier | G : ce sont des réglages qui changent ce que l'app produit (la synthèse) |
| trimestres.js:2402 | La table de correspondance privée écrite pendant un export « format recherche » | G : elle ne se reconstruit pas |
| portfolio.js:277 | Sélection automatique du portfolio écrite à l'ouverture du détail, sans geste | M, mais elle écrit une donnée pédagogique sans geste : à signaler à part |
| bilan-reflexif-csv.js:98 | « Charger les données de démo » écrit dans la vraie clé des résultats | M (démo) |
| snapshots.js:1157, 849 | Vider ou reconstruire les captures, par bouton | M : ce sont des données dérivées |
| trust-tofu.js:93 | Registre de confiance écrit pendant l'import d'un paquet | couvert si le point 28 est raccordé (même geste) |
| profil-etudiant-rapport.js:505, export-pdf.js:90/3277, rythme.js:533, preferences.js:256 (`modeExpert`, `accompagnementActif`, options de rapport) | Réglages d'affichage ou d'export : A ou G ? | A, sauf si on veut qu'un codex restauré garde ces réglages |
| rapport-bug.js:87/111/123 | Archive des rapports de bug | A : ce n'est pas une donnée pédagogique |
| import-export.js `executerImportSelectif` | Un import sélectif qui ajoute des données au trimestre en cours : doit-il marquer le codex « pas à jour » ? | Rangé en X comme demandé, mais contrairement à un import complet, le codex ouvert ne contient plus ce qui est à l'écran |
| travaux-stockage.js:292/944 (mixte) | Point unique avec option `discret`, ou 20 appels, un par geste ? | Point unique : 20 gestes répartis dans 8 fichiers, c'est là qu'un oubli arrive |

## Trouvailles en chemin (issue 2 : inscrire et continuer, sauf mention)

1. **Code mort (34 sites G sans déclencheur)** : `groupe.js` (UI entière, `#students-tbody` absent d'`index.html`), les boutons d'édition de séance de `horaire.js` (`#seancesContainer` absent), `EnseignantsEntite` / `HorairesEntite` / `CoursEntite.supprimer` (appelés seulement par `_archives/`), `importerDans*Active` ×5, `importerCartoucheJSON`, `ajouter*ABibliotheque` ×3, `attribuer/retirerJetonPersonnalise`, `verrouillerEvaluation`, `partagerPratique`, `mettreAJourNom/Description/DisciplinePratique`, `mettreAJourConfigurationPratique`, `dupliquerEchelle`, `confirmerSeanceV2`, `confirmerSeances`, `sauvegarderGroupeEtudiantsV2`, `capturerSnapshotIntervention`, `importerSnapshots`. Issue 3 dans le lot F (ne pas raccorder). Leur retrait est un autre chantier.
2. **Deux fonctions globales `supprimerPratiqueDefinitivement`** (donnees-v2.js, locale à son IIFE, et pratiques-gestion.js:968 sur `window`), qui ne font pas la même chose. Sans conséquence observée, parce que donnees-v2 appelle sa version locale. Issue 3.
3. `obtenirCartouchesGrille` (cartouches.js:62) : son commentaire dit « appelée vingt-quatre fois », mais le grep ne trouve aucun appel. Issue 3.

## Tables par famille

Légende : G = geste hors témoin (à raccorder) · C = déjà couvert · M = machine · A = état d'affichage · X = hors codex · Z/… = sous moratoire (catégorie qu'il aurait) · « — » = la ligne n'est pas une écriture (commentaire, code commenté). « introuvable » = aucun appelant vivant trouvé (grep du nom, de `data-action`, `data-on-change`, `addEventListener`).

### 1. Annotations, copies (travaux) et corbeille

| fichier:ligne | fonction | clé écrite (base) | déclencheur | catégorie | note |
|---|---|---|---|---|---|
| js/travaux-stockage.js:894 | sauvegarderAnnotations | annotationsTravaux | `sauvegarderAnnotationFichier` ← travaux-annotation `sauvegarderAnnotation` (minuterie après chaque trait, changement de page, fermeture) ; `supprimerAnnotationsFichiers` ← `supprimerDefinitivement` (C) et `purgerCorbeilleExpiree` (boot) | G | LE geste le plus fréquent de l'app. Le trait d'annotation ne fait jamais parler le témoin. |
| js/travaux-stockage.js:292 | sauvegarderFichiersTravaux | fichiersTravaux | 13 appelants : `ajouterFichierTravail` (import de copies), `supprimerFichierTravail`, `mettreAJourFichier` (renommer, propriétés, reprise, sync groupe à la sauvegarde d'évaluation), `mettreAJourFichiersBatch`, `reassocierFichier(s)Batch` (réassigner, transfert), `deplacerEnCorbeille`, `restaurerDeCorbeille`, `marquerExporte` (export PDF/archivage), `migrerBlobStatut` (boot), `_migrerThumbnailsVersIDB` (boot), `reimporterFichier` (travaux-import) | G | Mixte : voir le détail des gestes ci-dessous. |
| js/travaux-stockage.js:944 | sauvegarderCorbeille | corbeilleFichiers | `deplacerEnCorbeille`, `restaurerDeCorbeille`, `supprimerDefinitivement`, `viderCorbeille` (gestes) ; `purgerCorbeilleExpiree`, `_migrerThumbnailsVersIDB` (boot) | G | Mixte. |
| js/travaux-stockage.js:705 | stockerThumbnail (catch) | thumbnail_<id> | import/édition de copie | M | Vignette = cache régénérable. |
| js/travaux-stockage.js:753 | supprimerThumbnail | thumbnail_<id> | suppression de copie | M | Cache. |
| js/travaux-stockage.js:1192,1207,1217 | _migrerThumbnailsVersIDB | thumbnail_*, _migration_thumbnails_done | boot | M | |
| js/travaux-doublons-ui.js:36 | _enregistrerValidations | doublonsValidations (cle) | `_persisterValidation` / `_persisterValidationsLot` (boutons de l'écran des doublons) | G | |
| js/travaux-ui.js:186 | arreterChrono | historique du chrono | `sauvegarderEvaluation` (evaluation-sauvegarde:355) et `_postSauvegardeMod` (evaluation.js:1851), tous deux après un `sauvegarderDonneesSelonMode` réussi | C | |
| js/travaux-ui.js:7463 | initialiserFondCanvas (écouteur) | travaux-fond-canvas | choix de couleur de fond | A | |
| js/modelisation.js:238 | sauvegarderFichiers | fichiersModelisation (cle) | `ouvrirFichierLocal` (data-action `modelisation.ouvrirFichierLocal`), `supprimerFichierModelisation` | G | |
| js/modelisation.js:432 | supprimerFichierModelisation | annotationsTravaux | data-action `modelisation.supprimerFichier` | G | Même geste que la ligne 238 (un seul appel suffit). |
| js/migration-diagnostic.js:176-179 | migrationSnapshot | *_backup_v1, flag | outil console | M | |
| js/migration-diagnostic.js:282 | migrationSupprimerFichierId | flag de migration | outil console (window) | M | Écrit le flag ; la donnée passe par `sauvegarderDonneesSelonMode` discret. |
| js/migration-diagnostic.js:469 | reparerReferencesProductions | (diverses) | console, `{ dryRun: false }` | M | |
| js/migration-diagnostic.js:565 | reparerCoursIdProductions | (diverses) | console | M | |

Détail des gestes qui atteignent `sauvegarderFichiersTravaux` / `sauvegarderCorbeille` :

| geste (appelant) | déjà couvert ? |
|---|---|
| `supprimerFichierDefinitivement`, `viderTouteCorbeille` (liste-evaluations), `supprimerFichierImporte` (travaux-ui:3807) | C (appel `sauvegarderDonneesSelonMode` dans la même fonction) |
| `_synchroniserGroupeCoursFichierSauv` (evaluation-sauvegarde:340) | C (dans `sauvegarderEvaluation`) |
| `_detacherFichiersDeEvaluation` (evaluation-jetons:328/330) | C (appelée après `_persisterEvaluationsJetons` réussi) |
| `appliquerJetonRepriseSurCopie` (liste-evaluations:1966/1974) | C seulement si une évaluation active existe ; sinon G |
| `importerFichier` (travaux-import:850/862), `reimporterFichier` (travaux-import:1616/1631), `traiterDoublonsImport` (travaux-ui:4340/4342/4376), `assemblerGroupesPipeline` (travaux-ui:4651) | G |
| `renommerFichierDepuisListe` (liste-evaluations:1749), `ouvrirProprieteFichier` (:1936), `confirmerSuppressionFichier` (:2045), `restaurerFichierCorbeille` (:2859) | G |
| `sauvegarderEdition` (travaux-ui:6594/6607), `corrigerGroupeCoursIdFichiers` (:2755), `ecrireReassignation` (:4866/4868), `executerTransfert` (:7357) | G |
| `appliquerActions` (travaux-doublons-ui:499), `nettoyerDoublonsExacts` (travaux-resolution:560/564) | G |
| `marquerExporte` (travaux-export-pdf:86/868/1332, travaux-archivage:621/704) | À trancher (métadonnée « exporté » posée par un geste d'export) |
| `migrerBlobStatut`, `purgerCorbeilleExpiree`, `_migrerThumbnailsVersIDB` | M |

### 2. Tampons, rétroactions, raccourcis (outils d'annotation)

| fichier:ligne | fonction | clé écrite (base) | déclencheur | catégorie | note |
|---|---|---|---|---|---|
| js/travaux-outils.js:708,725,740,749,758,767,798,1007 | sauvegarderRetroactionsObservations, …Personnalisation…, NomsCategories, SymbolesPerso, CategoriesPerso, CouleursCategories, OrdreCategories, OrdreAutocollants | retroactionsObservations, personnalisationObservations, nomsCategoriesTampons, symbolesUnicodePerso, categoriesPerso, couleursCategories, ordreCategories, ordreAutocollants_* | `enregistrerRetroObservations` (bouton « Enregistrer », et `exporterTampons`) ; `confirmerImportTampons` | G | Un seul geste par appelant. |
| js/travaux-outils.js:2927,2938,2994 | enregistrerRetroObservations | categoriesMasquees, elementsMasques, tamponsPersonnalises | data-action `travauxOutils.enregistrerRetroObservations` | G | |
| js/travaux-outils.js:3012-3030 (17 sites) | reinitialiserRetroObservations | toutes les clés ci-dessus → null | data-action `travauxOutils.reinitialiserRetroObservations` | G | |
| js/travaux-outils.js:3506,3527,3528 | confirmerImportTampons | tamponsPersonnalises, categoriesMasquees, elementsMasques | `confirmerEtFermerImportTampons` (import d'un fichier de tampons) | G | Import d'un fichier de tampons, pas d'un codex. |
| js/travaux-outils.js:712,1128,1136 | sauvegarderRetroactionsErreursFr, …PersonnalisationErreursFr, …OrdreErreursFr | retroactionsErreursFr, personnalisationErreursFr, ordreErreursFr | `enregistrerRetroErreursFr` | G | |
| js/travaux-outils.js:3735,3736,3737 | reinitialiserRetroErreursFr | idem → null | data-action `travauxOutils.reinitialiserRetroErreursFr` | G | |
| js/travaux-outils.js:3843 | changerModeSyntheseErrFr | errfrModeSynthese | radio data-on-change | G | À trancher (réglage de la rétroaction). |
| js/travaux-outils.js:1236 | definirRaccourci | raccourcisAnnotation | écouteurs clavier de `afficherRaccourcis`, `enregistrerRetroObservations`, `enregistrerRetroErreursFr` | G | À trancher (réglage). |
| js/travaux-outils.js:1186,1216 | obtenirRaccourcisAnnotation | raccourcisAnnotation | écrit à la lecture (défauts, normalisation) | M | |
| js/travaux-outils.js:809 | IIFE de nettoyage | elementsMasques | chargement du script | M | |
| js/travaux-outils.js:880,890,899,901,909,922,936,950,965,968 | migrerIdsActionsRLO | annotations, noms/ordres/couleurs de catégories, flag | `auDbPret` | M | |
| js/tampons-bibliotheque.js:31 | sauvegarder | bibliothequeTampons | `partagerTampon`, `supprimerDeBibliotheque`, `importerFichier` (→ `importerDansBibliotheque`), `partagerCategorie` | G | Point unique pour 4 gestes. |
| js/tampons-bibliotheque.js:161,167 | ajouterDepuisBibliotheque | tamponsPersonnalises, tamponsImages | data-action `tamponsBibliotheque.ajouterDepuisBibliotheque` | G | |
| js/reserve-ouvrir.js:1195 | appliquerReimport | tamponsPersonnalises | data-action `ReserveOuvrir.appliquerReimport` | X | Réimport depuis la Réserve. |

### 3. Carte d'alignement (planification)

| fichier:ligne | fonction | clé écrite (base) | déclencheur | catégorie | note |
|---|---|---|---|---|---|
| js/planification-donnees.js:147 | setDonnees | planification_* (CLE_DONNEES) | `sauvegarderCarte` ← planification-carte `sauvegarder()` (56 appels : chaque édition de nœud/lien), `importerCarte`, `dupliquerCarteActive` ; `sauvegarderIndex` ← `nouvelleCarte`, `renommerCarteActive`, `supprimerCarteActive`, `changerCarte`, `definirCoursDeCarte` (panneau cours), planification-bibliotheque ; `supprimerCarte` ; `importerDepuisBibliotheque` ; `initialiserSiNecessaire` et `migrerDonneesProto` (boot) | G | Point unique de la carte. Mixte : `changerCarte` = A, init/migration = M. |
| js/planification-donnees.js:576 | copierSeancesLecons | planification_seances | `importerCarteDepuisTrimestre` ← `reprendreCarte`, panneau d'import (boutons) | G | Même geste que l'import de carte. |
| js/planification-carte.js:3742 | supprimerNoeud | planification_seances | touche Suppr, menu, `supprimerNoeud` (4 appelants) | G | Le nœud part aussi par `sauvegarder()` : un appel au geste couvre les deux. |
| js/planification-carte.js:549 | migrerObjectifsVersMetadata | planification_seances | chargement | M | |
| js/planification-carte.js:4552 | definirContournement | préférence contournement | bouton de la barre | A | |
| js/planification-carte.js:12524 | écouteur couleur | planif-fond-canvas | choix de couleur | A | |
| js/planification-bibliotheque.js:42 | sauvegarderBibliotheque | bibliothequeAlignements | `ajouterAlignementALaBibliotheque`, `retirerAlignementDeLaBibliotheque` | G | |
| js/planification-bibliotheque.js:109 | seederDemoSiNecessaire | bibliothequeAlignements | chargement du script | M | |
| js/demo-namespace.js:265 | peuplerNamespace | demo_planification_mindmap | pack démo | M | |
| js/main.js:489,494,509,604,605 | auDbReady | planification_seances, mindmap, flags | boot | M | |

### 4. Jetons

| fichier:ligne | fonction | clé écrite (base) | déclencheur | catégorie | note |
|---|---|---|---|---|---|
| js/evaluation-jetons.js:867 | initialiserJetonsEtudiant | jetonsEtudiants | écrit à la LECTURE (`obtenirStatutJetonsEtudiant`, appelé par le profil et la sauvegarde) | M | Déjà inscrit (#721). |
| js/evaluation-jetons.js:943 | attribuerJetonPersonnalise | jetonsEtudiants | introuvable (exporté, jamais câblé ; audit 2026-09-06) | G | Code mort : rien à raccorder tant qu'il n'est pas câblé. |
| js/evaluation-jetons.js:973 | retirerJetonPersonnalise | jetonsEtudiants | introuvable (idem) | G | Idem. |

### 5. Bilan réflexif

| fichier:ligne | fonction | clé écrite (base) | déclencheur | catégorie | note |
|---|---|---|---|---|---|
| js/bilan-reflexif-core.js:320 | sauvegarderQuestionnaire | questionnaire (bilan) | éditeur : `modifierPreambule`, `confirmerEdition`, etc. (7 appels dans bilan-reflexif-editeur) | G | Point unique. |
| js/bilan-reflexif-core.js:324 | sauvegarderParcours | parcours (bilan) | bilan-reflexif-parcours : `toggleQuestionParActivite`, etc. (5 appels) | G | Point unique. |
| js/bilan-reflexif-csv.js:577 | confirmerImport | résultats (bilan) | data-action `BilanReflexif.confirmerImport` (import CSV des réponses) | G | |
| js/bilan-reflexif-rapport.js:661 | supprimerResultats | résultats (bilan) | data-action `BilanReflexif.supprimerResultats` | G | |
| js/bilan-reflexif-csv.js:98 | chargerResultatsDemo | résultats (bilan) | data-action `BilanReflexif.chargerResultatsDemo` | M | À trancher : un bouton, mais écrit des données de démo dans la vraie clé. |

### 6. Portfolio

| fichier:ligne | fonction | clé écrite (base) | déclencheur | catégorie | note |
|---|---|---|---|---|---|
| js/portfolio.js:431 | toggleArtefactPortfolio | portfoliosEleves | case à cocher (`toggleArtefactPortfolioFromEl`, data-on-change) | G | |
| js/portfolio.js:277 | chargerPortfolioEleveDetail | portfoliosEleves | ouverture du détail (sélection automatique) | M | À trancher : écrit une sélection pédagogique à l'ouverture d'un écran. |
| js/portfolio.js:41 | repararPortfoliosEleves (IIFE) | portfoliosEleves | chargement du script | M | |
| js/portfolio.js:798,857 | _calculerEtStockerIndicesCPInterne | indicesCP | recalcul | M | |

### 7. Suivi longitudinal (registre)

| fichier:ligne | fonction | clé écrite (base) | déclencheur | catégorie | note |
|---|---|---|---|---|---|
| js/registre-longitudinal.js:408 | ajouterResultat | registre longitudinal (global) | `ajouterResultatLongitudinal` (bouton) | G | |
| js/registre-longitudinal.js:421 | retirerResultat | idem | bouton de retrait | G | |
| js/registre-longitudinal.js:449 | retirerDuRegistre | idem | `retirerEleveLongitudinal` (bouton « Retirer du registre ») | G | |
| js/registre-longitudinal.js:584 | inscrire | idem | inscription d'un élève (bouton de l'écran) | G | |

### 8. Tirage et boîte à outils

| fichier:ligne | fonction | clé écrite (base) | déclencheur | catégorie | note |
|---|---|---|---|---|---|
| js/boite-outils.js:40 | sauvegarderEtatTirage | etatTirage | `afficherResultat` (tirage), `toggleExclusionEtudiant`, `appliquerParamsTirage`, `reinitialiserTirageComplet` ; `initialiserTirage` (ouverture) | G | Mixte : l'appel d'`initialiserTirage` (l. 88, 147) est M. À trancher : état de tirage = donnée ou affichage ? |
| js/boite-outils.js:508 | sauvegarderEtatQuestions | questions (cle) | `ajouterCategorie`, `supprimerCategorie`, `ajouterQuestion`, `modifierQuestion`, `changerCategorieQuestion`, `appliquerParamsQuestions`, `toggleRemiseQuestions`, `afficherResultatQuestion` | G | Contenu saisi (questions) + état de tirage. |

### 9. Élèves suivis (tableau de bord)

| fichier:ligne | fonction | clé écrite (base) | déclencheur | catégorie | note |
|---|---|---|---|---|---|
| js/tableau-bord-apercu.js:175 | sauvegarderEtudiantsSuivis | etudiantsSuivis | `ajouterEtudiantSuivi`, `retirerEtudiantSuivi`, écouteur de `initialiserModuleTableauBordApercu` (vider) | G | |
| js/tableau-bord-apercu.js:170 | obtenirEtudiantsSuivis | etudiantsSuivis | semis à la lecture | M | |

### 10. Présences

| fichier:ligne | fonction | clé écrite (base) | déclencheur | catégorie | note |
|---|---|---|---|---|---|
| js/saisie-presences.js:871 | basculerVerrouillageDate | datesVerrouillees | `basculerVerrouillageDateActive` (data-on-change) | G | |
| js/saisie-presences.js:2465 | ajouterPresencesIntervention | presences | `transfererPresencesVersModule` ← enregistrement d'une intervention (interventions.js:1691, après `sauvegarderDonneesSelonMode`) | C | |
| js/interventions.js:1851 | transfererPresencesVersModule (repli) | presences | idem | C | |
| js/saisie-presences.js:827 | obtenirDatesVerrouillees | datesVerrouillees | semis à la lecture | M | |
| js/saisie-presences.js:1271,1274,1277 | initialiserSaisiePresences (écouteurs) | presences_date, presences_groupe, presences_tri | choix de date, groupe, tri | A | |
| js/saisie-presences.js:2179 | filtrerTableauPresences | recherchePresences | champ de recherche | A | |
| js/interventions.js:1869 | initialiserModuleInterventions | interventions | init | M | |

### 11. Trimestre, cours, groupes-cours, horaires, enseignants (hors moratoire)

| fichier:ligne | fonction | clé écrite (base) | déclencheur | catégorie | note |
|---|---|---|---|---|---|
| js/trimestre-v2-groupes-cours.js:869,879,880 | supprimerGroupeCoursV2 | groupesCours, groupeCoursActif, infoCours | data-action `supprimerGroupeCoursV2` | G | |
| js/trimestre-v2-groupes-cours.js:1057,1063,1064 | supprimerGroupeCoursDepuisBibliotheque | idem | bouton de la bibliothèque | G | |
| js/trimestre-v2-groupes-cours.js:1093,1099,1100 | masquerGroupeCoursDepuisBibliotheque | groupesCours (dansSidebar) … | bouton « Masquer » | G | À trancher (G ou A). |
| js/trimestre-v2-groupes-cours.js:1128 | afficherGroupeCoursDepuisBibliotheque | groupesCours (dansSidebar) | bouton « Afficher » | G | À trancher (G ou A). |
| js/trimestre-v2-groupes-cours.js:814 | sauvegarderGroupeCoursV2 | groupeCoursActif | même fonction que `sauvegarderDonneesSelonMode` | C | |
| js/trimestre-v2-horaires.js:473 | supprimerSeanceV2 | horaireHebdo (cleHoraire) | data-action `supprimerSeanceV2` | G | |
| js/trimestre-v2-horaires.js:1072,1078,1084 | supprimerHoraireV2 | horaires, horaireHebdo, horaireSelectionne | data-action `supprimerHoraireV2` | G | |
| js/trimestre-v2-horaires.js:445 | confirmerSeanceV2 | horaireHebdo | introuvable (exportée, aucun bouton) | G | Code mort probable. |
| js/trimestre-v2-horaires.js:526 | chargerHorairesV2 | horaireSelectionne | ouverture | M | |
| js/trimestre-v2-horaires.js:573,588,596 | changerHoraireSelectionneV2 | horaireSelectionne | menu déroulant | A | |
| js/trimestre-v2-cours.js:586,587 | activerCoursV2 | cours (actif), infoCours | data-action `activerCoursV2` | A | À trancher (écrit aussi `cours[].actif`). |
| js/trimestre-v2-cours.js:1460,1470,1471 | _resyncInfoCoursSiActif, _activerSiPremierCours | infoCours, cours | après `ecrireEtAnnoncer('cours', …)` (l. 1536, 1611) | C | |
| js/trimestre-v2-cours.js:214,226 | chargerDropdownCoursV2 | infoCours | ouverture | M | |
| js/trimestre-v2-cours.js:143,146 | _migrerListeCoursVersCoursV2 | cours, listeCours | boot | M | |
| js/entites/cours-entite.js:116,242 | creerCours, mettreAJourCours | cours | `ecrireEtAnnoncer` (trimestre-v2-cours) → C ; `creerMonService` (rencontres:367) → G | C | L'appel de `creerMonService` est couvert si on raccorde `creerMonService`. |
| js/entites/cours-entite.js:267 | supprimerCours | cours | introuvable | G | Code mort (aucun appel de `CoursEntite.supprimer`). |
| js/entites/enseignants.js:71,170,195 | creerEnseignant, mettreAJourEnseignant, supprimerEnseignant | enseignants | introuvable (seul `_archives/` appelle) | G | Code mort. |
| js/entites/horaires.js:90,171,196 | creerHoraire, mettreAJourHoraire, supprimerHoraire | horaires | introuvable (seul `_archives/`) | G | Code mort. |
| js/entites/groupe-cours.js:228,232,246,255 | synchroniserInfoCours | infoCours, groupeCoursActif, seances, horaireHebdo | contexte.js:122 (`changerCoursDepuisEntete`, introuvable) | A | Contexte actif. |
| js/trimestre-v2-enseignants.js:294 | _apresEcritureEnseignant | profilEnseignant | après `sauvegarderDonneesSelonMode('enseignants')` | C | |
| js/trimestre-v2-enseignants.js:53 | chargerProfilEnseignantV2 | enseignants | ouverture (migration de l'ancien profil) | M | |
| js/trimestre-v2-enseignants.js:55 | — | — | — | — | Code commenté. |
| js/trimestre-v2-etudiants.js:584 | filtrerParGroupeV2 | groupeSelectionne | data-on-change | A | |
| js/trimestre-v2-etudiants.js:981 | creerNouveauGroupeV2 | groupeSelectionne | data-action | A | Le groupe n'existe qu'en mémoire à ce stade. |
| js/trimestre-v2-etudiants.js:1513 | sauvegarderGroupeEtudiantsV2 | groupeEtudiants | introuvable | G | Code mort. |
| js/trimestre-v2-init.js:295,330 | sauvegarderIdentificationTrimestreV2, creerTrimestreV2 | trimestreActif | après `sauvegarderDonneesSelonMode('trimestres')` non discret | C | |
| js/trimestre-v2-init.js:436,484 | sauvegarderCadreCalendrierV2, reinitialiserBornesTrimestreV2 | calendrierComplet (retrait) | après `sauvegarderDonneesSelonMode('cadreCalendrier')` | C | |
| js/trimestre.js:73,93,244 | genererCalendrierComplet | horaireHebdo, calendrierComplet | dérivé (après le cadre, boot, démo) | M | |
| js/trimestre-v2-orchestre.js:181,192,213,215,235,251,252,408,409 | _definirInfoCoursMode*, changerGroupeCoursActifV2 | groupeCoursActif, infoCours, groupesCours (actif), horaireHebdo, seancesHoraire | menu du groupe-cours actif, `rencontres` | A | À trancher : écrit aussi `groupesCours[].actif`. |
| js/trimestre-v2-orchestre.js:25 | — | — | — | — | Commentaire. |
| js/contexte.js:108,111,145,160,164 | changerCoursDepuisEntete | groupesCours, groupeCoursActif, infoCours, cours | introuvable (window seulement) | A | |
| js/trimestres.js:534 | creerTrimestre | trimestres | `creerMonService` (rencontres:347) ; trimestre-v2-liste:646 (moratoire) | G | Raccorder DANS `creerTrimestre` couvre les deux sans toucher au fichier sous moratoire. |
| js/trimestres.js:560,565,577,578 | changerTrimestreActif | trimestres (actif), trimestreActif, infoCours, groupeCoursActif | trimestre-v2-liste:466 (moratoire), rencontres, démo | A | À trancher. |
| js/trimestres.js:634,659 | creerGroupeCoursDemoSiNecessaire | horaires, groupesCours | `changerTrimestreActif` (démo) | M | |
| js/trimestres.js:266,348 | obtenirTrimestres, corrigerTrimestresMultiplesActifs | trimestres | réparation à la lecture | M | |
| js/trimestres.js:1024,1108,1155,1203,1213,1216,1616,1621,1650,1653,1665,1671,1674,1747,1755,1756,1833,1854,1868,1898 | migrations (namespace, résidus, multi-trimestres, A2025), init | diverses | boot | M | |
| js/trimestres.js:1860 | — | — | — | — | Code commenté. |
| js/trimestres.js:1515 | — | — | — | — | Commentaire. |
| js/trimestres.js:2402 | exporterFormatRecherche | tableCorrespondance_<trim> | data-action `exporterFormatRecherche` | G | À trancher (table privée produite par un export). |
| js/trimestres.js:723 | archiverTrimestre | trimestres | trimestre-v2-liste:216 (bouton « Archiver ») | Z/G | Moratoire : ne pas toucher. |
| js/trimestres.js:967 | creerSnapshotRessources | instantané des ressources du trimestre | `archiverTrimestre` | Z/G | Même geste que l'archivage. |
| js/trimestres.js:1297 | desarchiverTrimestre | trimestres | trimestre-v2-liste:244/299 (bouton « Désarchiver ») | Z/G | Moratoire (désarchivage rangé avec l'archivage). |
| js/trimestres.js:1341 | purgerCopiesModelesArchive | copies de modèles du trimestre | `desarchiverTrimestre` | Z/G | Même geste. |
| js/trimestres.js:3006 | purgerTrimestresOrphelins | clés d'un trimestre orphelin | console (window) | X | Suppression de trimestre. |
| js/trimestres.js:1559,1563 | supprimerTrimestre | toutes les clés du trimestre, trimestres | trimestre-v2-liste:440 | X | Suppression d'un trimestre entier. |
| js/cours.js:396 | retirerCoursDeBibliotheque | cours | bouton « Retirer de ma sélection » | G | |
| js/cours.js:540,542,543 | supprimerFicheCoursAvecGarde | références gardées, cours, infoCours | `supprimerFicheCours` et `supprimerCoursV2` (trimestre-v2-cours:389) | G | |
| js/cours.js:572 | ajouterCoursIndividuel | cours | bouton « Ajouter à ma sélection » | G | |
| js/cours.js:698 | importerCoursSimple | cours | data-on-change (fichier .json) | G | |
| js/cours.js:768 | partagerCours | cours | bouton « Déposer dans les cours disponibles » | G | |
| js/cours.js:75,107 | migrerCoursVersPratiques, migrerCoursDansBibliotheque | cours | boot | M | |
| js/rencontres.js:354,377,382,413 | creerMonService | cadreCalendrier, cours, groupeEtudiants, groupesCours | data-action `creerMonService` | G | Aucun appel au témoin dans rencontres.js. |
| js/rencontres.js:307 | — | — | — | — | Commentaire. |
| js/horaire.js:1231 | confirmerSeances | seances du cours | introuvable (window seulement) | G | Code mort. |
| js/horaire.js:1466,1500 | sauvegarderEditionSeanceEnPlace, supprimerSeance | seances du cours | boutons générés dans `#seancesContainer`, absent d'index.html | G | Déclencheur introuvable dans le DOM : code mort. |
| js/horaire.js:537,596,605,714 | migrerDonneesSeances, genererSeancesCompletes | seancesHoraire, seancesCompletes | boot / dérivé | M | |
| js/groupe.js:945 | supprimerEtudiant | groupeEtudiants | délégation sur `#students-tbody`, absent d'index.html | G | Code mort. |
| js/groupe.js:448 | confirmImport | groupeEtudiants | introuvable (window seulement) | G | Code mort. |
| js/groupe.js:869 | resetStudentsData | groupeEtudiants (clé nue) | introuvable | G | Code mort. |
| js/groupe.js:86 | sauvegarderTousLesEtudiants | groupeEtudiants | introuvable | G | Code mort. |
| js/migrations.js:53-979 (19 sites) | migrer* | diverses | boot | M | Lignes 53, 93, 163, 192, 281, 379, 398, 453, 560, 626, 716, 774, 810, 811, 854, 861, 874, 879, 945, 947, 979. |
| js/migrations.js:1027,1041 | migrerDescriptionVersActivite | flag | boot | M | |

### 12. Productions

| fichier:ligne | fonction | clé écrite (base) | déclencheur | catégorie | note |
|---|---|---|---|---|---|
| js/productions.js:473 | typerProductionCommeTerminale | productions | data-action | G | |
| js/productions.js:2396,2435 | monterEvaluation, descendreEvaluation | productions | boutons ↑ ↓ | G | |
| js/productions.js:3418 | supprimerProduction | productions | data-action `supprimerProduction` | G | |
| js/productions.js:2339 | verrouillerEvaluation | productions | introuvable | G | Code mort. |
| js/productions.js:3082 | migrerProductionsVersBibliotheque | productions | init | M | |
| js/productions-liste.js:38 | dupliquerEtEditerProduction (modifierListe) | productions | `BibliothequeUI.dupliquerEtEditerItem` | G | Voir le point commun BibliothequeUI (§15). |
| js/productions-liste.js:327 | dupliquerProduction | productions | `dupliquerProductionActive` (bouton) | G | |
| js/productions-liste.js:408 | supprimerProductionActive | productions | data-action (index.html:4622) | G | |
| js/productions-liste.js:472 | importerProductionsExternes | productions | reserve-ouvrir:1163 | X | |
| js/productions-bibliotheque-ui.js:293 | ajouterProductionIndividuelle | productions | bouton « Ajouter à ma sélection » | G | |
| js/productions-bibliotheque-ui.js:281 | — | — | — | — | Commentaire. |
| js/productions-bibliotheque-ui.js:664 | retirerProductionDeBibliotheque | productions | bouton « Retirer » | G | |
| js/productions-bibliotheque-ui.js:714 | supprimerProductionDefinitivement | productions | bouton « Supprimer », donnees-v2 `confirmerSuppressionRessource` | G | |
| js/productions-bibliotheque-ui.js:764 | dupliquerProductionBibliotheque (modifierListe) | productions | bouton « Dupliquer » | G | §15. |
| js/productions-bibliotheque-ui.js:794 | ajouterProductionsABibliotheque | productions | introuvable | G | Code mort. |
| js/productions-bibliotheque.js:88 | ajouterALaBibliotheque | bibliothequeProductions | `importerUneProductionTrimestre`, `importerDansBibliotheque` (import de fichier) | G | |
| js/productions-bibliotheque.js:135 | retirerDeLaBibliotheque | bibliothequeProductions | suppressions (productions-bibliotheque-ui, donnees-v2) | G | Même geste que la suppression. |
| js/productions-import-export.js:253 | importerDansProductionActive | productions | introuvable | G | Code mort. |
| js/productions-import-export.js:434 | confirmerImportProductions | bibliotheque | `confirmerEtFermerImport…` (import de fichier) | G | |
| js/productions-import-export.js:616 | sauvegarderMigrationCategories | productions | data-action `sauvegarderMigrationCategories` | G | |
| js/gabarits-utils.js:281 | ajouterGabaritsDefautSiManquants | bibliothequeGrilles, bibliothequeProductions | init | M | |

### 13. Grilles, échelles, cartouches

| fichier:ligne | fonction | clé écrite (base) | déclencheur | catégorie | note |
|---|---|---|---|---|---|
| js/grilles.js:2662 | ajouterGrilleIndividuelle | grillesTemplates | bouton « Ajouter à ma sélection » | G | |
| js/grilles.js:2747 | retirerGrilleDeBibliotheque | grillesTemplates | bouton « Retirer » | G | |
| js/grilles.js:3181,4831 | dupliquerGrilleBibliotheque, dupliquerEtEditerGrille (modifierListe) | grillesTemplates | boutons « Dupliquer » | G | §15. |
| js/grilles.js:2051 | confirmerImportGrilles | bibliothequeGrilles | `confirmerEtFermerImport…` (import de fichier) | G | |
| js/grilles.js:1899 | importerDansGrilleActive | grillesTemplates | introuvable | G | Code mort. |
| js/grilles.js:3210 | ajouterGrillesABibliotheque | grillesTemplates | introuvable | G | Code mort. |
| js/grilles.js:5566 | afficherConfigurationCategoriesErreurs | grillesTemplates | écrit les catégories par défaut à l'affichage ; appelant introuvable | M | |
| js/grilles.js:1493,1558,5677 | migrerGrillesVersBibliotheque, assurerGrilleGenerique, migrerCategoriesVersSousCriteres | grillesTemplates | init | M | |
| js/grilles.js:6454 | importerGrillesExternes | grillesTemplates | reserve-ouvrir:1153 | X | |
| js/grilles-bibliotheque.js:83 | ajouterGrilleALaBibliotheque | bibliothequeGrilles | `importerGrillesDansBibliotheque` ← grilles.js:3153 (geste d'import/partage) | G | |
| js/grilles-bibliotheque.js:123 | retirerGrilleDeLaBibliotheque | bibliothequeGrilles | suppressions (grilles.js:3104/3133, donnees-v2) | G | Même geste que la suppression. |
| js/echelles.js:1452 | ajouterEchelleIndividuelle | echellesTemplates | bouton | G | |
| js/echelles.js:1521 | retirerEchelleDeBibliotheque | echellesTemplates | bouton | G | |
| js/echelles.js:1639,2414 | dupliquerEchelleBibliotheque, dupliquerEtEditerEchelle (modifierListe) | echellesTemplates | boutons | G | §15. |
| js/echelles.js:1129 | confirmerImportEchelles | bibliothequeEchelles | import de fichier | G | |
| js/echelles.js:1666 | ajouterEchellesABibliotheque | echellesTemplates | introuvable | G | Code mort. |
| js/echelles.js:978 | importerDansEchelleActive | echellesTemplates | introuvable | G | Code mort. |
| js/echelles.js:203 | dupliquerEchelle | echellesTemplates | introuvable (le commentaire l. 169 le dit) | G | Code mort. |
| js/echelles.js:269,401 | migrerEchellesVersBibliotheque, assurerEchelleIdmeDeDepart | echellesTemplates | init | M | |
| js/echelles.js:3840 | importerEchellesExternes | echellesTemplates | reserve-ouvrir:1158 | X | |
| js/echelles-bibliotheque.js:74 | ajouterEchelleALaBibliotheque | bibliothequeEchelles | `importerToutEchellesTrimestreModal`, `importerUneEchelleTrimestre`, `importerEchellesDansBibliotheque` | G | |
| js/echelles-bibliotheque.js:264 | retirerEchelleDeLaBibliotheque | bibliothequeEchelles | suppressions | G | Même geste que la suppression. |
| js/cartouches.js:4592 | ajouterCartoucheIndividuelle | cartouches_<grille> | bouton | G | |
| js/cartouches.js:4671 | retirerCartoucheDeBibliotheque | cartouches_<grille> | bouton | G | |
| js/cartouches.js:4742 | supprimerCartoucheDefinitivement | cartouches_<grille> | bouton, donnees-v2 | G | |
| js/cartouches.js:4821,4833 | dupliquerEtEditerCartouche, dupliquerCartoucheBibliotheque (modifierListe) | cartouches_<grille> | boutons | G | §15. |
| js/cartouches.js:4400 | copierCartoucheDepuisTrimestre | cartouches_<grille> | `importerUneCartoucheTrimestre`, `importerToutCartouchesTrimestreModal` (boutons) | G | |
| js/cartouches.js:1996 | confirmerImportCartouches | bibliothequeCartouches | import de fichier | G | |
| js/cartouches.js:4858,4879,4896 | ajouterCartouchesABibliotheque | cartouches_*, grillesTemplates | introuvable | G | Code mort. |
| js/cartouches.js:2858 | importerDansCartoucheActive | cartouches_<grille> | introuvable | G | Code mort. |
| js/cartouches.js:3918 | importerCartoucheJSON | cartouches_<grille> | introuvable | G | Code mort. |
| js/cartouches.js:75 | obtenirCartouchesGrille | cartouches_<grille> | réparation à la lecture | M | |
| js/cartouches.js:215,248 | assurerCartoucheGenerique, migrerCartouchesVersBibliotheque | cartouches_* | init | M | |
| js/cartouches.js:5009 | importerCartouchesExternes | cartouches_* | reserve-ouvrir:1168 | X | |
| js/cartouches-bibliotheque.js:87 | ajouterCartoucheALaBibliotheque | bibliothequeCartouches | `importerCartouchesDansBibliotheque` (import) | G | |
| js/cartouches-bibliotheque.js:127 | retirerCartoucheDeLaBibliotheque | bibliothequeCartouches | suppressions | G | Même geste que la suppression. |
| js/donnees-v2.js:1707,1727 | supprimerGrilleDefinitivement | cartouches_<grille>, grillesTemplates | `confirmerSuppressionRessource` (modale de suppression, écran Données) | G | |
| js/donnees-v2.js:1776 | supprimerEchelleDefinitivement | echellesTemplates | idem | G | |
| js/donnees-v2.js:1689 | supprimerPratiqueDefinitivement (locale) | pratiquesConfigurables | idem | G | |
| js/donnees-v2.js:889 | supprimerParametreConfig | paramètre choisi → null | data-action `supprimerParametreConfig` | G | |
| js/main.js:143 | marquerRessourceSupprimee | ressourcesSupprimees | appelée par les suppressions ci-dessus | G | Même geste. |
| js/bibliotheque-ui.js:177 | basculerMasquerDejaPresent | masquer-déjà-présent | data-on-change | A | |
| js/repertoires-bibliotheque.js:33 | _ecrire | repertoires (dossiers de classement) | `creer`, `renommer`, `supprimer`, `assigner`, `retirerItem` (API des dossiers) | G | Point unique. |
| js/partage-section.js:96 | ecrire | grillesTemplates, cartouches_*, productions, echellesTemplates, pratiquesConfigurables, collections partagées | `ajouterACollection` / `dupliquerGrillePartagee` (copier depuis le partage), `supprimerDuPartage` (bouton) | G | Point unique. |
| js/partage-import.js:108 | ecrire | collections, registre des imports | `integrerPackage` ← import d'un paquet partagé (partage-import:726) | G | Import d'un paquet, pas d'un codex. |
| js/trust-tofu.js:93 | ecrireRegistre | registre TOFU | `memoriserContact` / `oublierAuteur` (pendant l'import d'un paquet) | M | À trancher. |
| js/cc-license.js:1480 | sauvegarderMetadonnees | métadonnées CC | data-action `sauvegarderMetadonnees` | G | |
| js/cc-license.js:589 | demanderMetadonneesEnrichies (onclick) | cc-derniere-description | mémoire du dernier texte saisi | A | |

### 14. Pratiques de notation, modalités, jugements, objectifs, seuils

| fichier:ligne | fonction | clé écrite (base) | déclencheur | catégorie | note |
|---|---|---|---|---|---|
| js/pratiques/denotation-jugements.js:125 | ecrireJugementDenotation | jugements de dénotation | `denotationSaisie.enregistrer` (bouton) | G | Donnée de notation. |
| js/pratiques/modalites-evaluation.js:49 | _ecrire | modalitesEvaluation | `modifier` / `remplacer` ← pratique-notation-v2 : `modifierObjectif`, `supprimerObjectif`, `regenererGrilleConversion`, `modifierGrilleConversion`, `ajouterTypeTravailSpec` (gestes) ; `chargerConfigParObjectifs` (ouverture), démo, import-export | G | Point unique, mixte. |
| js/pratiques/modalites-evaluation.js:129,150 | purgerLegacy | dureePeriode, modalites | boot (main.js:618) | M | |
| js/pratiques/pratique-manager.js:79,84 | changerPratiqueActive | groupesCours, groupeCoursActif | `activerPratique` (pratiques.js:581), `appliquerPratiqueAuCours` (pratiques-gestion:2248) | G | Choix de la pratique du groupe-cours. |
| js/pratiques/pratique-manager.js:208 | sauvegarderPratique | pratiquesConfigurables | `dupliquerPratique` (pratiques.js:893) ; `importerPratique`, `initialiserPratiquesPredefines` (M) | G | Mixte. |
| js/pratiques/pratique-manager.js:233 | supprimerPratique | pratiquesConfigurables | `supprimerPratique` (pratiques.js:998), `_jeterMaquette` (comparateur), `supprimerPratiqueParNom` | G | |
| js/pratiques/pratique-manager.js:142,175,176,183 | migrerVersBibliotheque | pratiquesConfigurables, flag | init | M | |
| js/pratiques.js:309 | definirPratiqueParDefaut | pratiqueParDefaut | `changerPratiqueParDefaut` | G | |
| js/pratiques.js:1028 | adopterMaquette | pratiquesConfigurables | comparateur (« adopter ») | G | |
| js/pratiques.js:1474 | retirerPratiqueDeBibliotheque | pratiquesConfigurables | data-action | G | |
| js/pratiques.js:1503 | ajouterPratiqueIndividuelle | pratiquesConfigurables | data-action | G | |
| js/pratiques.js:1569 | supprimerPratiqueHorsBibliotheque | pratiquesConfigurables | data-action | G | |
| js/pratiques.js:1620 | partagerPratique | pratiquesConfigurables | introuvable | G | Code mort. |
| js/pratiques.js:112,113,115,451 | migrerConfigurationsSpecifiques, migrerEtablissementsPratiques | pratiquesConfigurables, flag | init | M | |
| js/pratiques.js:2019 | sauvegarderEtatAccordeons | etatsAccordeonsV2 | accordéon | A | |
| js/pratiques.js:2282 | importerPratiquesExternes | pratiquesConfigurables | reserve-ouvrir:1173 | X | |
| js/pratiques-gestion.js:853 | ajouterPratiqueALaSelection | pratiquesConfigurables | bouton « Ajouter » | G | |
| js/pratiques-gestion.js:937 | retirerPratiqueDeLaSelection | pratiquesConfigurables | `retirerPratiqueDeBibliothequeMateriel` | G | |
| js/pratiques-gestion.js:981 | supprimerPratiqueDefinitivement | pratiquesConfigurables | bouton « Supprimer » (et le nom rivalise avec celui de donnees-v2) | G | |
| js/pratiques-gestion.js:1056,1142 | dupliquerPratiqueBibliotheque, dupliquerEtEditerPratique (modifierListe) | pratiquesConfigurables | boutons | G | §15. |
| js/pratiques-gestion.js:665 | copierPratiqueDepuisTrimestre | pratiquesConfigurables | `importerUnePratiqueTrimestre`, `importerToutPratiquesTrimestreModal` | G | |
| js/pratiques-gestion.js:2469 | confirmerImportPratiques | bibliothequePratiques | import de fichier | G | |
| js/pratiques-gestion.js:2099,2122,2135 | mettreAJourNomPratique, …Description…, …Discipline… | pratiquesConfigurables | introuvable | G | Code mort. |
| js/pratiques-bibliotheque.js:362 | ajouterPratiqueALaBibliotheque | bibliothequePratiques | `sauvegarderConfigurationActuelle` (pratiques-bibliotheque:816, geste) | G | |
| js/pratiques-bibliotheque.js:399 | mettreAJourConfigurationPratique | bibliothequePratiques | introuvable | G | Code mort. |
| js/pratiques-bibliotheque.js:434 | retirerPratiqueDeLaBibliotheque | bibliothequePratiques | `supprimerPratiqueDeBibliothequePartagee` (pratiques-gestion:1026), donnees-v2 | G | |
| js/objectifs.js:58 | sauvegarderEnsemblesObjectifs | objectifsTemplates | `creerNouvelEnsembleObjectifs`, `ajouterObjectifEnsemble`, `retirerObjectifEnsemble`, `sauvegarderEnsembleObjectifs`, `supprimerEnsembleObjectifs`, `dupliquerEnsembleObjectifs`, `traiterImportObjectifs` | G | Point unique. |
| js/interpretation-config.js:174 | sauvegarderSeuilsInterpretation | seuilsInterpretation | `reinitialiserSeuilsInterpretation` | G | Le réglage normal passe déjà par preferences-v2:408 (C). |
| js/interpretation-config.js:163 | chargerSeuilsInterpretation | seuilsInterpretation | écrit à la lecture (fusion) | M | |
| js/actions-rlo.js:120,136,137 | migrerActionsRLOEvaluations | evaluations, flag | boot | M | |
| js/indices.js:30 | — | — | — | — | Commentaire. |

### 15. Point commun : duplication par BibliothequeUI

Les 11 sites `modifierListe: (mutateur) => db.modifier(…)` (cartouches 4821/4833, echelles 1639/2414, grilles 3181/4831, pratiques-gestion 1056/1142, productions-liste 38, productions-bibliotheque-ui 764) passent tous par `BibliothequeUI.dupliquerEtEditerItem` (bibliotheque-ui.js:513) ou `BibliothequeUI.dupliquerVersBibliotheque` (bibliotheque-ui.js:581). Ces deux fonctions portent le geste « Dupliquer » : un appel au témoin dans chacune, après `await d.modifierListe(...)`, couvre les onze.

### 16. Évaluation, profil, rapports, réglages

| fichier:ligne | fonction | clé écrite (base) | déclencheur | catégorie | note |
|---|---|---|---|---|---|
| js/profil-etudiant-rapport.js:460 | ecrireNotesRapportEnAttente | notesRapport | saisie dans le champ (minuterie 400 ms, `enregistrerNotesRapport`) | G | Texte saisi par l'enseignant. |
| js/profil-etudiant-rapport.js:505 | sauvegarderPreferencesRapport | preferencesRapport | `cocherSectionRapport` (case) | A | À trancher (sections choisies pour le rapport). |
| js/profil-etudiant-actions.js:735 | calculerEtStockerPatternsGroupe | indicesPatternsRaI | recalcul (tableau de bord) | M | |
| js/profil-etudiant-diagnostics.js:364 | changerOngletDeveloppement | profilOngletDeveloppementActif | onglet | A | |
| js/evaluation.js:147 | nouvelleEvaluation | dernieresSelectionsEvaluation | bouton « Nouvelle » | A | |
| js/evaluation.js:455 | memoriserSelectionsEvaluation | dernieresSelectionsEvaluation | écouteurs des menus | A | |
| js/evaluation.js:483 | sauvegarderSelectionsEvaluation | dernieresSelectionsEvaluation | travaux-ui:776, 3369 | A | |
| js/liste-evaluations.js:463 | sauvegarderEtatFiltres | filtresListeEvaluations | filtres | A | |
| js/liste-evaluations.js:535 | reinitialiserFiltres | filtresListeEvaluations | bouton | A | |
| js/export-pdf.js:90 | sauvegarderReglagesPDF | reglagesPDF | `ouvrirApercuPDF`, `ouvrirApercuPDFDepuisInline` | A | À trancher (réglages d'export). |
| js/export-pdf.js:3277 | exporterPDFDepuisApercu | reglagesPDF | data-action | A | À trancher. |
| js/preferences.js:256 | ecrireStockage | preferences | `definirPreference` : preferences-v2 (C, `ecrireEtAnnoncer`) ; accueil (banniereAccueilRepliee, modeExpert), modes (accompagnementActif, modeClair), carte (palettes repliées, disposition), transitions, presences-rapport, planification-export, accompagnement | A | Mixte : surtout de l'affichage ; à trancher pour `modeExpert`, `accompagnementActif`, options de rapport. |
| js/preferences.js:385,461,535 | migrerPreferencesV3, enrichirPrefsV3DepuisTrimestres, nettoyerLegacy | flags | boot | M | |
| js/rythme.js:533 | sauvegarderPreferences | preferencesRythme | data-on-change / data-on-input (index.html:8982-9022) | A | À trancher (paramètres de l'outil Rythme). |
| js/rythme.js:1248 | écouteur colonnes | rythmeColonnesT1/T2 | case de colonne | A | |
| js/rapport-bug.js:87 | archiverRapportBug | rapportsBugArchives | `copierRapportBug` et 2 autres envois | A | À trancher (G ou A : pas une donnée pédagogique). |
| js/rapport-bug.js:111,123 | supprimerRapportArchive, viderRapportsArchives | rapportsBugArchives | boutons | A | Idem. |
| js/modal-backup-reminder.js:100,101,108,109 | definirProchainRappel, desactiverRappels | rappel de sauvegarde | choix dans la modale | A | |
| js/init-inline.js:139 | ecrireRepereVu | version/build vus | boot, bandeau de version | A | |

### 17. Codex, import, Réserve, démo, boot (M et X)

| fichier:ligne | fonction | clé écrite (base) | déclencheur | catégorie | note |
|---|---|---|---|---|---|
| js/codex.js:132,137,153 | _migrerClesClasseurVersCodex | _codex_* | boot | X | |
| js/codex.js:188,195 | _purgerCodexHistLegacy | _codex_* | boot | X | |
| js/codex.js:283 | _sauvegarderEtat | _codex_etat | codex | X | |
| js/codex.js:649,755,776,811,816 | chargerCodex | toutes les clés, plan de purge | ouverture d'un codex | X | |
| js/codex.js:1192,1443,1445,1473,1475 | fermerCodex, _ecrireSnapshotAvant, _migrerSnapshotVersIndexHash | _codex_snapshot | codex | X | |
| js/codex.js:1734,1770 | _executerPurgeEspace, purgerEspacePrecedent | clés de l'espace précédent | codex | X | |
| js/codex.js:2437,3218,3222 | _fusionnerTravaux, actionFusionner | fichiersTravaux, clés fusionnées | fusion de codex | X | |
| js/codex.js:3101 | actionRenommer | _codex_etat | codex | X | |
| js/import-export.js:1555,2588,2614,2647,2707,2802,2915,2954,2982,3018,3088,3108,3126,3146,3161,3177,3195,3211,3230,3248,3284 | _restaurerBlobsDepuisZip, executerImportConfigComplete, executerImportLocalStorageBrut, executerImportSelectif | toutes familles | import d'une archive | X | L'import sélectif est rangé ici (archive) : à trancher si on veut qu'il marque le codex « pas à jour ». |
| js/reserve.js:994 | _ecrireManifesteLocal | manifeste de la Réserve | Réserve | X | |
| js/reserve.js:135 | — | — | — | — | Commentaire. |
| js/snapshots.js:134,145,156 | initialiserModuleSnapshots | snapshots | init | M | |
| js/snapshots.js:133 | — | — | — | — | Commentaire. |
| js/snapshots.js:657 | capturerSnapshotSeance | snapshots | capture automatique de la semaine, reconstruction | M | |
| js/snapshots.js:849 | reconstruireSnapshotsHistoriques | snapshots | bouton « Reconstruction » (`lancerReconstructionRetroactive`), démo | M | Recalcul, même par bouton. |
| js/snapshots.js:722,770 | capturerSnapshotIntervention, mettreAJourSnapshotIntervention | snapshots | introuvable | M | Code mort. |
| js/snapshots.js:951 | importerSnapshots | snapshots | introuvable | M | Code mort. |
| js/snapshots.js:1157 | confirmerNettoyageSnapshots | snapshots | data-action (index.html:9601) | M | À trancher : geste, mais sur des captures dérivées. |
| js/demo-activation.js (34 sites : 118-574) | migrerResidusPhase5, fusionnerDemoVersGlobaux, activerModeDemo, retirerItemsDemoDesGlobaux, desactiverModeDemo | trimestres, globaux, contexte | pack démo | M | |
| js/demo-namespace.js:187,204,209,220,230,247 | peuplerNamespace | demo_* | pack démo | M | |
| js/main.js:313 | recalculerIndicesSiDemande | recalculerIndicesCP | boot | M | |
| js/main.js:369-864 (sauf 489-605, voir §3) | auDbReady | migrations diverses | boot | M | Lignes 369, 370, 371, 383, 388, 415, 423, 482, 641, 649, 689, 730, 765, 777, 816, 829, 836, 864. |
