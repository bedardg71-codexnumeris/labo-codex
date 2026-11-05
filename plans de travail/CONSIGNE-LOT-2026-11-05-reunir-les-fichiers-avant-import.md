# Consigne – Réunir les fichiers d'une copie avant de l'importer (5 novembre 2026)

> Écrite par Cowork le jeudi 5 novembre 2026 à 07 h 05 (Toronto), sur `main` local = `1bcc7b6d` (1.233.1, verdict du Mac en cours, rien de poussé). **À lancer après la mise en ligne de la 1.233.1**, une seule session à la fois.
> **Le parcours est validé par Grégoire** (5 nov., 6 h 55) : `plans de travail/PROPOSITION-2026-11-05-reunir-les-fichiers-avant-import.md`. Le pourquoi, mesuré : `plans de travail/AUDIT-2026-11-05-importation-association.md` (constats 1 à 4, 8, 13 et la table « Le parcours actuel »). Vécu par Grégoire le 5 nov. sur une reprise réelle en trois photos : la fiche entre au BACKLOG.

## 0. Avant tout

- Commit de docs seul : cette consigne, la proposition, l'audit, les deux icônes de `plans de travail/icones-proposees/`, et la fiche au BACKLOG.

## 1. Ce que le lot livre (le détail est dans la proposition)

Dans « Préparer et importer », étape Optimisation : cocher des fichiers dans la colonne « Originaux », « Réunir en une copie » ; la copie réunie s'encadre, ses pages se règlent aux flèches, « Défaire le regroupement » reste ; touchée, elle a dans l'inspecteur UN élève et UNE production (ou « Jeton de reprise » de telle production), écrits sur tous ses fichiers ; la confirmation liste les copies qui seront créées, sans doublon ni conseil de mettre le DA dans le nom quand l'élève est posé ; l'import assemble un PDF et, pour une reprise, rattache le jeton à cette copie unique. Productions habituelles ET reprises. **Critère : après l'import, aucun passage par « Modifier ».**

Et la pipette « Balance des blancs » : l'icône `pipette-bouton.svg` sur le bouton ; quand l'outil est armé, le curseur `cible-curseur.svg` (point chaud au centre de la croix) et la ligne « Touche une zone blanche de la feuille. » (mot validé par Grégoire, 7 h 04 ; elle compte surtout sur l'iPad, qui n'a pas de curseur).

## 2. Ce que la mesure dit déjà (à remesurer)

- La clé de regroupement `groupeDocumentId` n'est posée qu'au dépôt, depuis le nom (`preparerFichier`, `js/travaux-import.js:621`). Tout l'aval sait déjà traiter un groupe : colonne « Originaux » (`js/travaux-ui.js:1985-2045`), `assemblerPDFGroupe`, exemption des doublons (`js/travaux-import.js:2132-2138`), jeton (`js/travaux-ui.js:4720`, qui ne garde que le fichier le plus récent par élève × production).
- Il manque le geste qui pose la clé et recopie élève, production et `estReprise` sur le groupe.

## 3. Pièges connus

- ⚠ **La restauration de la file recalcule la clé depuis le nom Léa** (`js/travaux-import.js:1132`) : une copie réunie à la main qui contient un fichier au nom Léa serait scindée au rechargement. Une clé posée à la main doit survivre au rechargement.
- Un élève changé sur un fichier d'une copie réunie change celui de toute la copie (un groupe = un élève, jamais deux).
- L'assemblage doit précéder l'application du jeton, qui ne voit alors qu'un fichier.
- « Grouper » et « Assemblage auto » des Réglages spécifiques sont RETIRÉS (aucun lecteur de `groupeId` ni de `documentGroups`) ; cherche leurs mentions dans l'Aide et les infobulles et retire-les aussi.
- Mode anonymisation : la confirmation montre les noms comme le reste de l'import. `echapperHtml` partout.
- Mac et iPad planifiés séparément (cases à cocher au doigt, cibles de 44 px).

## 4. La preuve

- WebKit, par le geste : trois images sans DA, « Réunir en une copie », élève et « Jeton de reprise » d'une production déjà évaluée ; la confirmation n'annonce ni doublon ni DA à ajouter ; après l'import, **un seul fichier stocké** (PDF de trois pages, dans l'ordre réglé), `estReprise`, rattaché à l'évaluation de reprise, **aucun fichier orphelin**. Le même cas pour une production habituelle. Une copie réunie qui survit à un rechargement de la file.
- Un réglage posé à la pipette avant l'import se retrouve dans le fichier importé (repère de couleur relu dans le PDF stocké), reprise comprise.
- Contre-épreuves (skill `verification-adverse`). Noms fictifs.

## 5. Ce qui n'entre PAS

L'étiquette ★ d'une reprise rangée au bout du carrousel d'Annoter ; toute détection automatique de photos « qui vont ensemble » sans DA ; les constats 9, 10, 12 de l'audit. Aucune écriture dans les données de Grégoire (rien à réparer : sa reprise a été remise en ordre à la main).

## 6. Les mots

Proposés par Cowork, à soumettre à Grégoire au rapport avant la release : « Réunir en une copie », « Copie de 3 fichiers », la ligne de confirmation « [Élève] – Artefact 6, reprise – 3 pages ». Déjà validé : « Touche une zone blanche de la feuille. »

## 7. Fin

Commit, Vitest entier (depuis `tests/`), specs touchées. Release mineure (une fonction) avec la ligne des Nouvelles proposée à Grégoire ; verdict du Mac ; push à sa demande. Rapport `RAPPORT-2026-11-05-reunir-les-fichiers-avant-import.md` à Cowork.
