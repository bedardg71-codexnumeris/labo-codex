# Audit – importer une copie en plusieurs fichiers, l'associer à un élève et à une production (5 novembre 2026)

> Ouvert par Cowork le jeudi 5 novembre 2026 à 05 h 42 (Toronto), sur `main` = `2310fb4f` (1.233.0 en ligne). Rapport de bug de Grégoire du 5 nov. à 5 h 12 (Mac, Chrome, 1.233.0) et onze captures. Aucun nom d'élève réel ici : « l'élève du rapport ».

## L'objectif (validé par Grégoire le 5 nov., 5 h 25 et 5 h 34)

Avant d'importer, dans l'application : réunir plusieurs fichiers (des photos) en un seul travail, voir ces fichiers réunis dans la colonne de gauche, dans l'ordre des pages, et dire que ce travail est la copie, ou la reprise, de telle production pour tel élève ; la confirmation nomme l'élève. Rien à renommer hors de l'application. Vaut pour les reprises ET pour les productions habituelles. **Critère de réussite : l'utilisateur n'a plus à passer par « Modifier » pour réparer un import.**

## Constats mesurés (lecture seule de ses données, 5 nov., 5 h 30)

1. L'import d'une reprise en trois photos a créé **trois copies séparées** (une page chacune), toutes « reprise », même élève, même production.
2. **Une seule** des trois (la dernière) est rattachée à l'évaluation de reprise ; les deux autres n'ont aucune évaluation.
3. L'élève choisi dans l'inspecteur n'empêche pas la confirmation de les traiter en doublons, ni de demander « le DA dans le nom du fichier » pour regrouper.
4. Le panneau « Réglages spécifiques » ne liste qu'un fichier sous « Fichiers – navigation et assemblage » : « Grouper » n'a rien à grouper (hypothèse, à lire au code).
5. **Annoter : sous l'onglet de l'élève, l'évaluation affichée est la reprise (onglet sans cadenas), mais la copie affichée est l'original** (trois pages, annotations de la première évaluation). « Modifier » depuis Annoter ouvre alors l'original. La copie de reprise n'est pas joignable depuis Annoter.
6. La copie de référence, ouverte sur cet original, ne propose pas la reprise (rapporté par Grégoire, à mesurer).

7. **« Ajouter des pages » (Modifier) ajoute les photos brutes, sans l'optimisation de l'import, et ignore leur orientation** : trois photos de téléphone ajoutées à la copie de reprise sont couchées à 90° dans un cadre portrait (vu par Grégoire, 5 nov., 5 h 47). La copie de reprise compte alors quatre pages : 12 (optimisée à l'import), puis 10, 11, 12 (brutes, couchées). Grégoire n'a rien pivoté : les pages sont apparues ainsi, l'écriture étirée (largeur et hauteur échangées). **Cause lue au code** : sans opération dans la préparation, `_insererFichiersTraitesDansEditeur` (`js/travaux-ui.js`) garde le blob brut ; ses dimensions viennent d'un `new Image()`, qui applique l'orientation EXIF (portrait), mais l'assemblage (`js/travaux-import.js`, `doc.addImage(imgData, 'JPEG', …)`) colle les octets JPEG tels quels, sans l'orientation : l'image couchée est étirée dans une page portrait. ⚠ **Contournement RÉFUTÉ** : à 5 h 56, la photo ajoutée avec « Balance des blancs » paraissait droite dans l'éditeur ; mais une fois enregistrée (6 h 12, « 1/3 » dans Annoter), la page 10 est couchée et étirée dans Annoter. L'aperçu de l'éditeur ne prouve rien sur le PDF enregistré. Le diagnostic ci-dessus est donc incomplet : la déformation se produit (aussi) ailleurs que là où Cowork l'a située. À reproduire au banc avec une photo à EXIF « rotation 90 », en lisant le PDF enregistré, pas l'aperçu.
8. **« Fusionner » ne peut pas rapatrier les photos isolées** : il exclut tout fichier qui « a une évaluation », et `trouverEvaluationPourFichier` (`js/travaux-resolution.js`) résout par élève × production, pas par le lien du fichier. Les deux photos sans évaluation résolvent donc vers l'évaluation de reprise et sont exclues (lu au code, `ouvrirModalFusionEditeur`, `js/travaux-ui.js:7002`).

9. **Détail vu en chemin** : la fenêtre « Examiner » (cas à plusieurs fichiers) affiche pour l'original « Importé 2026-11-05 05 h 01 », l'heure de l'import de la reprise, alors que l'original a été importé le 30 oct. (lu dans ses données). Quel champ elle lit : à mesurer.

10. **Un enregistrement de « Modifier » a pu ne pas être pris sans que l'écran le dise** : à 5 h 58, l'éditeur montrait trois pages, curseur sur « Enregistrer » ; à 6 h 05, la copie n'en a qu'une. Cause à mesurer (geste non fait, fenêtre de mise à jour du codex laissée ouverte, ou échec muet).
11. **Annoter : la reprise a sa propre étiquette (★), mais pas à côté de l'original** : le carrousel suit l'ordre d'import (`genererGrilleFichiers`, `js/travaux-ui.js:3003`, sans tri), donc une reprise importée après coup se range au bout de la file. L'étiquette ouverte par Grégoire (cadenas) est l'original. **Confirmé par son geste** (6 h 09) : l'étiquette ★ était au bout du carrousel ; ouverte, elle montre la reprise (1/1) et la copie de référence propose l'original d'office.

12. **Trois étiquettes ★ pour le même élève** (recompté par Grégoire, 6 h 13) dans le carrousel à 6 h 09, alors que ses données n'ont plus qu'une copie de reprise pour cette production (les deux photos isolées sont à la corbeille depuis 6 h 01) : affichage non régénéré après la corbeille ? À mesurer.

## Remise en ordre de la reprise du rapport (5 nov., 5 h 35 à 6 h 01, par les gestes de Grégoire)

Les deux photos isolées sont à la corbeille. **État à 6 h 13** : la copie de reprise a trois pages (10, 11, 12), mais les pages 10 et 11 sont couchées et étirées (contournement réfuté, constat 7). Avant cela, à 6 h 05, **elle n'avait qu'une page dans ses données** (lu à 6 h 05 : un seul `/Type /Page`, 242 Ko, dernière modification à 5 h 53) : les pages 10 et 11, ajoutées avec « Balance des blancs » et vues à l'écran à 5 h 58, n'ont pas été enregistrées — geste non fait ou échec muet, à mesurer (constat 10). L'original et sa première évaluation n'ont pas été touchés. Aucun script n'a écrit dans ses données. Seul écart : la lecture de 6 h 05 a ouvert par erreur une base IndexedDB « MonitorageFichiers » inexistante, ce qui l'a créée vide ; elle a été supprimée aussitôt (vérifié par `indexedDB.databases()`), et l'app supprime d'elle-même une telle base vide (`_migrerMonitorageFichiers`, `js/db.js`).

## Dispositions

À venir : chaque constat recevra *inscrit* (n°), *refusé* (motif) ou *périmé*.
