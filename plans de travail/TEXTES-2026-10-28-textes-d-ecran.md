# Textes – Les textes d'écran qui contredisent le code (lot 5 du plan, #1152)

> Proposés par Cowork, corrigés et validés par Grégoire le 28 oct. 2026, un constat à la fois (tableau « Trouvé hors de la section Aide » d'`audit-aide-2026-10-24/AUDIT-AIDE-2026-10-24.md`, et les trouvailles des lots 2a à 3). **À intégrer mot pour mot** par Claude Code (consigne du lot 5, à venir). Chaque texte est mesuré au code avant d'être proposé.
> Déjà réglés, sans texte ici : le message du choix « Non recevable » (#1175, mots de Grégoire du 28 oct., 6 h 49) ; « En savoir plus » d'un terme souligné (lot 3).

## 1. La réinitialisation complète (Réglages › Données)

✅ **Validé par Grégoire le 28 oct. 2026 à 14 h 30** (« on garde »). Remplace, sous « Réinitialiser toutes les données », « Triple confirmation requise + mot de passe «EFFACER» par sécurité » (`index.html:9631`).

> Ton codex est d'abord écrit à part ; deux questions, puis le mot « EFFACER » à taper, confirment l'effacement.

Preuves : `js/import-export.js:2089-2110` (`reinitialiserDonnees` : `Codex.ecrireAPartAvantSuppression`, deux `confirm`, puis `prompt` « EFFACER »).

## 2. La note de l'écran Grilles de critères

✅ **Validé par Grégoire le 28 oct. 2026 à 14 h 31** (« on garde »). Dans la note de l'écran (`index.html:4967-4968`), la dernière phrase devient :

> Les grilles peuvent être réutilisées pour différentes productions.

(« et verrouillées une fois finalisées » part : aucun geste ne verrouille une grille.) Preuves : `js/grilles.js:1185-1215` (`basculerVerrouillageCritere`, exporté sur `window` l. 2180, sans aucun appelant dans `js/` ni `index.html`). Le code mort est à retirer au lot 5, à part (`noms_stables.json` le nomme : zone protégée, autorisation de Grégoire requise pour l'en retirer).

## 3. « Exporter ma config » (Réglages › Données, et sa bulle)

✅ **Validé par Grégoire le 28 oct. 2026 à 14 h 31** (« on garde »). Remplace « ZIP léger sans données étudiants : grilles, échelles, productions, cartouches. Pour partager avec des collègues (CC BY-NC-SA). » sous le bouton (`index.html:9398-9399`) et la bulle (`js/accompagnement-contenu-hover.js:197`, qui dit « un·e collègue » : la phrase validée la remplace telle quelle).

> Deux fichiers sans données d'étudiant·es, un .json et un LISEZMOI.txt : tes grilles, échelles, productions et cartouches, et quelques réglages de ta pratique. Pour partager avec des collègues (CC BY-NC-SA).

Preuves : `js/import-export.js:3986-3991` (les réglages : système de jetons, reprises, nombre d'artefacts, pratique active), `:4056-4079` (le contenu), `:4112-4150` (les deux téléchargements, .json et LISEZMOI.txt).

## 4. L'aide « i » d'Annoter et évaluer (`evaluations-annoter`)

✅ **Validé par Grégoire le 28 oct. 2026 à 14 h 32** (« on garde »). Dans `js/accompagnement-contenu-popup.js` :
- l'exemple « Formats de noms reconnus » (`:550`) devient : « 1234567_essai.pdf », « DA1234567_travail.jpg », « Exemple_Ada_1234567.pdf », « Essai_1234567_Artefact-8-p1.jpeg » (plusieurs pages : -p1, -p2…)
- le conseil sur le travail multi-pages (`:554`) devient, mot pour mot, le paragraphe de l'Aide validé le 17 sept. (`accordeon-aide-preparer-importer`, épinglé par `sentinelle-878`) :

> Une remise en plusieurs fichiers : pour que les pages s'assemblent en un seul document, numérote-les à la fin du nom — -p1, -p2… (ou _p 2, page 2, partie 2, part2, (2)). Une lettre — Artefact_1a, 1b — crée une AUTRE production : tu obtiens plusieurs documents et des doublons à la confirmation.

Preuves : `js/travaux-import.js:116-119` (les formes de numérotation des pages) ; l'Aide, `preparer-importer`. **À mesurer à l'intégration** : « Essai_1234567_Artefact-8-p1.jpeg » se rattache bien à la production « Artefact-8 » (un essai qui le lit) ; sinon, prendre un exemple que l'import lit ainsi, et le dire.

## 5. L'aide « i » de la section Accompagnement du profil

✅ **Validé par Grégoire le 28 oct. 2026 à 14 h 33** (« on garde »). Dans `js/profil-etudiant-sections-affichage.js:1081` (le bloc « À propos de cette section ») :
- la ligne « Contenu » devient :

> **Contenu :** la carte « Contexte d'apprentissage » (un badge sur A et C, et le bouton « Confidentiel ») • la carte « Observation de la structure des résultats d'apprentissage », si l'observation SOLO est activée • la carte « Modèle de la Réponse à l'intervention (RàI) » : le niveau, le pattern, le défi principal • l'historique des interventions et « + Nouvelle intervention »

- dans la ligne « Utilisation », « (clique sur «Nouvelle intervention») » devient « (clique sur « + Nouvelle intervention ») ».

Preuves : l'entrée de l'Aide `profil-etudiant` (lot 2c bis, mots validés le 28 oct., 12 h 07) ; le vocabulaire du risque retiré le 15 oct. (#821, `js/contexte-qualification.js:120-123`). **À mesurer à l'intégration** : chaque libellé cité existe à l'écran de la section (le bouton « Confidentiel », « + Nouvelle intervention ») ; « Échelle visuelle de positionnement du risque » ne se rend plus nulle part (sinon, le dire).

## 6. Le guidage de la démo et la fenêtre « Données démo » (décision de Grégoire, 28 oct., 14 h 34)

Pas de texte ici : les 19 bulles de `js/guidage-demo.js` (`GUIDAGE_TEXTES`) et la fenêtre « Données démo » (`js/accompagnement-contenu-popup.js:~1260-1285`) sont presque toutes périmées (« indicateurs ACPE », l'indice E, « Tableau de bord », « Liste des individus », « Planification — Carte mentale », « étudiants », « coche les présents », « recommandations générées automatiquement », « Mode démonstration & duplication CC », « dropdowns »…). **Décidé** : Claude Code les réécrit au lot 5, d'après la mesure (les comptes lus dans `js/pack-demo-10.js` : étudiant·es, présences, grilles, productions, nœuds et liens de la carte), avec les mots déjà validés de l'Aide (lots 2a à 3) ; Cowork les soumet ensuite à Grégoire par groupes de trois ou quatre.

## 7. L'aide « i » de Grilles de critères (`construction-grilles`)

✅ **Validé par Grégoire le 28 oct. 2026 à 14 h 34** (« on garde »). Dans `js/accompagnement-contenu-popup.js` :
- la section « texte » (`:177`) devient :

> Un critère qui se calcule à partir de ce que tu comptes sur la copie (des erreurs, des éléments manquants, des calculs…) peut être de type algorithmique : son atelier propose trois calculs tout faits, que tu peux retoucher, ou te laisse composer le tien (voir l'Aide, « Les critères algorithmiques »). Les grilles peuvent être dupliquées et modifiées pour créer des variantes adaptées à différents types de productions.

- l'alerte (`:184-187`, « La somme des pondérations des critères doit totaliser 100 % ») devient une section `conseil` :

> Le total des pondérations se colore : orange sous 100 %, rouge au-dessus, vert à 100 %. Une grille en points ne se mesure pas à 100.

Preuves : les trois calculs tout faits (« Pénalité proportionnelle à la longueur », « Rapport visé », « Pénalité fixe », TEXTES-2026-10-26-calculs-tout-faits.md) ; « Retoucher ce calcul », « Composer ton propre calcul » ; le total et ses couleurs (remesure du 27 oct., Conception, `creer-grilles` ; `js/grilles.js:832`, l'avis à l'enregistrement, qui ne bloque pas). **À mesurer à l'intégration** : les trois couleurs et le cas « grille en points » au code d'aujourd'hui.

## 8. La note « i » de « Dynamique des corrélations » (Labo › Études)

✅ **Validé par Grégoire le 28 oct. 2026 à 14 h 35** (« on garde »). Dans `index.html:9112`, la puce « Points carrés ■ = séances avec dépôt de production. Triangles ▼ = interventions de groupe. » devient :

> **Cercles vides ○** = séances avec dépôt de production ; **cercles pleins ●** = les autres. **Triangles ▼** = interventions de groupe.

Preuves : `js/correlations-longitudinales.js:406-431` (style `circle` partout ; fond `transparent` pour une séance avec artefact, plein sinon), `:537` (le plugin des triangles d'intervention).

## 9. Les bulles des onglets du Labo et de l'Animation (`js/accompagnement-contenu-hover.js`)

✅ **Validé par Grégoire le 28 oct. 2026 à 14 h 36** (« oui, on garde »), **avec son autorisation de toucher `js/navigation.js`** (zone protégée) pour les deux lignes qui relient les deux onglets sans bulle à leur clé (la table des onglets vers les clés `nav-*`, ~l. 149-191 ; rien d'autre dans ce fichier).

- `nav-labo` : « Analyser ta démarche : observation, modélisation, exploration des pratiques, rythme de travail, études, bilan réflexif et suivi longitudinal. »
- `nav-labo-modelisation` : « Ouvre un document (PDF, JPG, PNG ; HEIC selon le navigateur) pour le projeter et l'annoter devant le groupe. »
  ↻ **29 oct. 2026, Cowork** : « ou HEIC » devient « ; HEIC selon le navigateur », par la décision de Cowork du 28 oct. sur « + Ouvrir » (ci-dessous), que la mesure du lot 5 a confirmée : la Modélisation range le HEIC sans le décoder, seul Safari l'affiche (`js/modelisation.js:249-253`). Dit à Grégoire le 29 oct. ; le reste de la bulle ne bouge pas.
- `nav-labo-rythme` : « Tes durées d'évaluation par activité, l'estimation de ta charge et sa planification. »
- `nav-labo-etudes` : « Deux études de ton groupe, « Dynamique des corrélations » et « Impact des jetons sur la performance » : des pistes de réflexion, pas des preuves. »
- `nav-labo-bilan` : « Composer et exploiter un bilan réflexif de fin de trimestre auprès des étudiant·es. »
- `nav-suivi-animation` : « Questions flash, tirage au sort et formation d'équipes pour l'animation en classe. »
- **neuve**, Exploration des pratiques (`labo-comparateur`) : « Ce que deux ou trois pratiques de notation feraient des mêmes parcours, sur des profils fictifs ou sur ton groupe. »
- **neuve**, Suivi longitudinal (`labo-longitudinal`) : « Inscris le dossier d'un·e étudiant·e au registre, et retrouve ses résultats dans les cours suivants. »

Preuves : l'entrée `labo` de l'Aide (lot 2d) ; `js/modelisation.js:79-92` (les formats) ; `js/config.js:85-93` (les sous-onglets). **À mesurer à l'intégration** : l'identifiant réel des deux sous-onglets dans la table de `js/navigation.js` (`labo-comparateur`, `labo-longitudinal` présumés d'après `config.js`) ; « retrouve ses résultats dans les cours suivants » contre l'écran du Suivi longitudinal (« Résultats ultérieurs »).

## « Élève » dans les écrans d'enseignant (décision de Cowork, annoncée à Grégoire le 28 oct., 14 h 37)

Pas de texte à valider : la règle de l'application (« étudiant·e » dans les textes affichés) s'applique. Claude Code remplace « élève » par « étudiant·e » dans les écrans d'enseignant (relevé de l'audit : `index.html` ~7395, 8338, 8393-8396, le bilan réflexif `js/bilan-reflexif-parcours.js:36-38`, la fiche d'intervention `js/interventions.js:1080-1081`, et ce qu'une recherche en trouve d'autre), **sauf** dans les écrans du service d'orthopédagogie (Rencontres, `js/rencontres.js`, le vocabulaire « rencontre » de `js/interventions.js`), où « élève » est le mot voulu ; une phrase partagée par les deux vocabulaires suit le vocabulaire actif. Les cas ambigus sont listés dans la demande de relecture.

## 10. Le nom des fichiers partagés

✅ **Validé par Grégoire le 28 oct. 2026 à 14 h 37** (« on garde »). Dans `genererNomFichierExport` (`js/cc-license.js:1565`), la partie de licence du nom de fichier devient :

> CC-BY-NC-SA

Preuves : `js/cc-license.js:1508, 1522, 1565` (« CC-BY-SA ») contre la licence réelle, `js/partage-schemas.js:45` (« CC BY-NC-SA 4.0 ») et `js/import-export.js:4064` ; appelé par les exports des grilles, échelles, cartouches, pratiques, productions, tampons, objectifs, de la config et d'« Exporter pour partager ». **À mesurer à l'intégration** : aucun lecteur ne reconnaît un fichier à « CC-BY-SA » dans son nom (un import qui le chercherait doit accepter les deux).

## 11. L'atelier du critère algorithmique, l'introduction de l'étape « Cas d'interprétation »

✅ **Validé par Grégoire le 28 oct. 2026 à 14 h 38** (« on garde »). Dans `js/atelier-algo.js:108` (`intro`), la phrase « Le nom court s’imprime dans la rangée des paliers de son PDF. » est **retirée** ; le reste de la chaîne ne change pas (« L’étudiant·e lit le cas de sa copie sous le critère, après le décompte. Un verdict sans bloc est précédé de la moyenne, sauf au premier cas : « Tu fais en moyenne 1 … à chaque N …. » Un bloc sans valeur disparaît. »).

Preuves : aucun rendu PDF ne lit le nom d'un palier (`js/synthese-retroaction-rendu.js`, la ligne du PDF est `ligneCalculAlgo` ; constat de la relecture du lot 2b, 27 oct.). **À l'intégration** : si `critere-algorithmique-mots` épingle cette chaîne, il suit par décision, en citant ce fichier.

## 12. Le bouton qui rouvre l'étiquetage (« Apporter mon matériel »)

✅ **Validé par Grégoire le 28 oct. 2026 à 14 h 38** (« on garde »). Dans `js/materiel.js:115`, « Revenir à ma dissection » (texte marqué PROVISOIRE) devient :

> Revenir à mon étiquetage

Preuves : l'écran de l'étape s'intitule « Étiquette ta grille » (`index.html`, `dissection-titre`) ; `sentinelle-aide-apporter-mon-materiel` interdit « dissection » dans tout texte neuf. L'entrée de l'Aide `apporter-grille` (lot 2b) décrit le geste sans citer le bouton : elle peut maintenant le citer. L'entrée 1.21x des Nouvelles (`js/changelog-data.js:228`) est un historique publié : elle ne change pas.

## La fenêtre « Comment fonctionne la bibliothèque » (décision de Cowork, 28 oct.)

Rien à changer : le texte validé par Grégoire le 25 oct. redevient vrai quand les gestes qui manquent à certaines fenêtres seront ajoutés (#1160 à #1167, déjà inscrites) ; l'Aide porte d'ici là la phrase provisoire validée le 27 oct. (disposition de l'audit). À reprendre avec ces fiches.

## 13. L'import, à l'étape « Optimisation » (le menu de production d'un fichier)

✅ **Validé par Grégoire le 28 oct. 2026 à 14 h 39** (« on garde »). Dans `js/travaux-ui.js:2072-2078` :
- l'étiquette « Modifier » devient « Production de ce fichier » ;
- la ligne dessous, « Ce fichier seulement — le sélecteur global « Production » ne l'écrasera pas. », devient :

> Le sélecteur « Production » commun à tous les fichiers ne l'écrasera pas.

- au même endroit (`:2063`), « Étudiant » devient « Étudiant·e » (la règle annoncée le 28 oct. à 14 h 37).

**À l'intégration** : l'Aide (`preparer-importer`, lot 2c) dit « le menu de production d'un fichier » : elle peut citer le libellé neuf.

## 14. Les noms des niveaux de la RàI

✅ **Décidé par Grégoire le 28 oct. 2026 à 14 h 39** (« on garde », sur la recommandation de Cowork). Partout, le niveau porte son nom d'intensité : **Universel, Préventif, Intensif** (le profil, le Suivi du groupe, le guide RàI le disent déjà : `index.html:7440-7442, 7635-7637`, `js/accompagnement-contenu-popup.js:285-287`, `js/guides-pedagogiques.js:209-213`). Changent :
- la fiche d'intervention (`js/interventions.js:121-122`, vocabulaire `interventions`) :

> Niveau 2 – Préventif, en groupe ciblé
> Niveau 3 – Intensif, individuel

- la bulle de l'option RàI (`js/accompagnement-contenu-hover.js:149`, `pref-outils-rai`) : « universel, ciblé, intensif » devient « universel, préventif, intensif ».

**À l'intégration** : le vocabulaire `rencontres` de la même fiche (s'il nomme les niveaux) suit, ou dit pourquoi pas ; l'Aide (`planifier-rai`, lot 2c bis) recopie les libellés neufs ; le badge « Groupe » / « Individuel » de la liste des interventions (`js/interventions.js:473`) dit le format, il reste.

## 15. La note « i » de « Dynamique des corrélations » : la ligne « P contrôle »

✅ **Validé par Grégoire le 28 oct. 2026 à 14 h 40** (« on garde »). Dans `index.html:9118`, la fin de la ligne « P contrôle », « Si l'écart entre P ciblés et P contrôle se réduit après une intervention, celle-ci a eu un effet. », devient :

> Si l'écart entre P ciblés et P contrôle se réduit après une intervention, c'est une piste : l'intervention a peut-être joué, parmi d'autres causes possibles.

Preuves : la même note (« Une corrélation… ne prouve pas une cause à effet »), l'Aide (`labo`, lot 2d : « des pistes de réflexion, pas des preuves ») et l'aide contextuelle de l'écran (`js/accompagnement-contenu-popup.js:916-929`).

## 16. L'aide « i » des Interventions (`interventions-planification`), l'« Objectif visé »

✅ **Validé par Grégoire le 28 oct. 2026 à 14 h 40** (« on garde »). Dans `js/accompagnement-contenu-popup.js:~737`, l'item « Objectif visé — Suggestion automatique basée sur le critère le plus faible et le prochain seuil IDME. Tu peux modifier librement. » devient :

> Objectif visé — Vide au départ ; « Suggérer » en propose un, d'après le critère ciblé le plus faible du sous-groupe et le prochain seuil (64 % ou 75 %). Tu peux le modifier librement.

Dans la même aide, « Coche les étudiants concernés » devient « Coche les étudiant·es concerné·es ». Preuves : `js/interventions.js:1138` (« Suggérer »), `:1433-1480` (le critère ciblé le plus faible, les seuils `idme.developpement` 0,75 et `idme.insuffisant` 0,64, fixes, #551).

## Décisions de Cowork sur le reste (28 oct., sans texte à valider)

- **Le guide ACP** cite « l'Aperçu » (`js/guides-pedagogiques.js:126`) : « Suivi du groupe ».
- **« Comparateur de pratiques »**, titre de l'écran (`js/comparateur-pratiques.js:720, 1048`) et terme du glossaire, devient « Exploration des pratiques », le nom du sous-onglet (`js/config.js`).
- **« + Ouvrir » de la Modélisation** annonce le HEIC sans dire qu'il peut échouer (`js/modelisation.js:249-253`) : mesurer, et dire « selon le navigateur » si c'est le cas.
- **Le glossaire** (`terme.js`), suites du lot 3 : `cours` (« un seul cours actif », « dupliquer » : mesurer), `groupe-cours` (cinq éléments obligatoires, comme l'écran), `production` (plus de « module Planification ») : corrections de fait.
- **Le soulignement** s'arrête aux mots entiers (« critère » n'est plus souligné dans « critères », ni « cours » dans « parcours ») : `accompagnement.js:1630`, `regexEnrichissement`.
- **À mesurer d'abord, puis proposer** (Claude Code ; ce qui touche les mots revient à Grégoire) : « Système de jetons » affiché pour une pratique Standards ; l'option « Reprise ciblée » (la masquer ne touche aucune donnée) ; le champ « Séance concernée » sans lecteur ; le résumé « n/5 configurés » du groupe-cours, qui compte la pratique et pas le trimestre.
- **Le code mort** (issue 2, retrait) : la branche de l'ancien assistant (`js/materiel-assistant.js:233, 297, 373-375`), `allerVersAide`, `ouvrirAideGroupeCours`, `basculerVerrouillageCritere` (ce dernier est nommé dans `noms_stables.json`, zone protégée : **autorisé par Grégoire le 28 oct. 2026 à 14 h 42** (« oui j'autorise ») : retirer la fonction et son entrée de `noms_stables.json`, rien d'autre dans ce fichier).
