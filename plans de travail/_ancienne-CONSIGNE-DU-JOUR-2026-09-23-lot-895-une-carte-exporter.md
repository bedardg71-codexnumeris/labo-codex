# Consigne du jour – Une seule carte « Exporter des travaux » (#895)

> Écrite le 23 septembre 2026, 16 h 50 (Toronto), par Cowork, sur `origin/main` = `c5dec89e` (1.155.7, en production chez Netlify depuis 16 h 19, déploiement mesuré ; les deux textes validés du lot N6 vérifiés mot pour mot sur `main`). **Proposée** tant que Grégoire ne l'a pas relayée.
> La précédente (lot N6, livrée en 1.155.7) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-23-lot-n6-reglages.md` (déplacée par Cowork, à commiter avec ce lot). La file des pratiques de notation est vide ; retire aussi la ligne « une seule carte « Exporter des travaux » (#895) » de la tête de `FILE-DES-LOTS.md` à la livraison.
> **La fiche fait foi** : `BACKLOG.md`, #895, et sa décision : `plans de travail/DECISIONS-2026-09-17-apres-midi.md`. Dernier lot de l'audit « Exporter et archiver » du 16 sept.

## 0 · La décision de Grégoire (17 sept. 2026, 13 h 36) – elle fait foi

**Une seule carte « Exporter des travaux »**, avec la **forme des dossiers** (par étudiant·e / par étudiant·e et production) et la **compression** en options, et **« Toutes / Tous » accepté comme un export complet**. Écartés : garder les deux cartes en réparant le refus ; retirer « Trimestre complet » sans reprendre sa forme.

## 1 · Ce que Cowork a mesuré (lecture seule, 16 h 45)

- **Deux cartes** dans `genererSectionArchivage` (ou équivalent, `js/travaux-ui.js` ≈ l. 1280-1330) : « Exporter des travaux » (menus `travaux-archivage-production` / `-etudiant`, bouton `travauxUI.lancerArchivage`) et « Trimestre complet » (menus `travaux-archivage-semestre-*`, barre de progression, bouton `travauxUI.lancerArchivageSemestre`). Mêmes filtres, mêmes contenus (originaux, annotés, évaluations JSON).
- **Le refus** : `lancerArchivage` (`travaux-ui.js` ≈ l. 3597-3606) fait `alert('Sélectionne au moins un étudiant ou une production')` quand les deux menus sont à leur valeur de départ « Toutes / Tous ». Un `alert` natif, en plus.
- **Deux moteurs** dans `js/travaux-archivage.js` : `exporterTravaux(da, productionId)` (l. 163, arborescence `étudiant·e/fichier`, sans compression) et `exporterSemestre(options, onProgression)` (l. ≈ 232, arborescence `étudiant·e/production/fichier`, `_resume.json` avec les pertes nommées, DEFLATE niveau 6, progression).
- **⚠ Une différence qui compte pour tes données** : `lancerExport` marque « exporté » ce qui est réellement parti (`marquerExporte`, #891, ≈ l. 615-618) ; `lancerExportSemestre` (l. 680) **ne marque rien**. Or « Proposer un nettoyage » ne propose que des copies exportées (#892).
- **L'aide** décrit les deux cartes (`index.html` ≈ l. 11735-11736) ; elle a été réécrite en 1.151.4 (#893, spec `aide-exporter-archiver-893.spec.js`).

## 2 · Ce que fait le lot

**2a. Une carte, un moteur.** « Exporter des travaux » garde ses deux menus (Production, Étudiant·e), gagne deux options (forme des dossiers ; compression) et la barre de progression. « Toutes / Tous » exporte tout le groupe, sans refus. « Trimestre complet » disparaît, **et l'un des deux moteurs avec lui** (zéro-dette) : un seul `exporter…` porte les deux arborescences, `_resume.json`, les pertes nommées (#565, #891) et la compression. Lequel garder, et sous quel nom, relève de toi.

**2b. « Exporté » suit la règle de #891 pour tout export.** Tout fichier réellement mis dans l'archive est marqué « exporté », quelle que soit l'option. **Décidé par Cowork (technique)** : c'est la règle déjà livrée, appliquée au chemin qui y échappait. Conséquence à écrire dans le rapport : un export complet rend ses fichiers éligibles à « Proposer un nettoyage », qui, lui, ne supprime toujours rien sans la question de #892.

**2c. Les valeurs par défaut des options.** **Décidé par Cowork** : forme « par étudiant·e et production » et compression activée, soit la forme de « Trimestre complet » (la plus complète et la plus légère). Si tu mesures que cela change le résultat d'un parcours existant (spec, banc) au-delà de l'arborescence, dis lequel.

**2d. Le refus disparaît avec son `alert`.** Aucune sélection n'est plus « invalide ». Si un filtre ne donne aucun fichier, le bilan de l'export le dit (mécanisme existant de `_afficherBilanExport`), sans `alert`.

**2e. Les mots.** Les libellés des deux options et de leurs choix, et la phrase de l'aide qui remplace les deux lignes de cartes, sont lus par les enseignant·es : **propose-les dans le rapport**, sur le modèle des mots déjà à l'écran (« Évaluations en JSON + productions en PDF », « étudiant·e »). Grégoire les validera avant le push.

## 3 · Arrêt prévu

Si le moteur retiré est appelé ailleurs que depuis cette carte (export Léa, archivage d'un trimestre, Réserve, un bouton d'un autre écran), **arrête-toi et dis où** : ce chemin-là ne disparaît pas sans décision.

## 4 · Tests

- Carte unique : « Toutes / Tous » produit une archive complète (tous les fichiers du groupe, `_resume.json` compris) ; une production seule ; un·e étudiant·e seul·e ; les deux.
- Les deux formes de dossiers, les deux états de compression.
- Un fichier illisible : sauté, nommé dans le bilan et dans `_resume.json`, les autres partent (#891).
- « Exporté » : posé sur ce qui est parti, et seulement là, dans chaque option.
- Sentinelle : plus de carte « Trimestre complet », plus de `lancerArchivageSemestre`, plus d'`alert` dans ce chemin, un seul moteur.
- La spec de l'aide (#893) suit le nouveau texte.
- Break-test sur chaque assertion ; suite Vitest complète verte ; une spec WebKit qui télécharge réellement l'archive par le bouton et lit son contenu.

## 5 · Livraison

- Version **mineure** par `scripts/release.mjs` (un geste change de forme à l'écran). Item de « Nouvelles » **proposé, à valider par Grégoire avant le push**.
- Ordre : commit, relecture de Cowork, corrections, **revérification de Cowork si du code change**, verdict, push.
- **Porte terrain** : le téléchargement d'une archive sur iPad (Safari) ne se juge pas en WebKit de bureau. Si tu l'estimes due, écris son markdown dans `plans de travail/` (skill `portes-terrain`) ; Cowork publie l'artefact.

## 6 · Le geste que Grégoire vérifiera à l'écran

Dans « Exporter et archiver », une seule carte « Exporter des travaux » ; laisser « Toutes / Tous » et cliquer « Télécharger » donne l'archive de tout le groupe, rangée par étudiant·e et par production.
