# Proposition – Réunir les fichiers d'une copie avant de l'importer (5 novembre 2026)

> Proposée par Cowork le jeudi 5 novembre 2026 à 06 h 53 (Toronto), à valider par Grégoire avant tout code. Suite de l'audit `AUDIT-2026-11-05-importation-association.md` (le regroupement ne se décide aujourd'hui que par le nom des fichiers). Vaut pour une production habituelle comme pour une reprise. Les mots entre « » sont des propositions de mots d'écran, à corriger.

## Le parcours proposé, geste par geste

1. **Déposer les fichiers** dans « Préparer et importer », comme aujourd'hui. Si leurs noms portent le DA (format Léa), l'app les réunit déjà d'elle-même : rien ne change.
2. **Cocher, dans la colonne de gauche, les fichiers qui forment une seule copie**, puis « Réunir en une copie ». Ils s'encadrent ensemble, comme les groupes Léa d'aujourd'hui. Les flèches règlent l'ordre des pages ; « Défaire le regroupement » existe déjà.
3. **Toucher la copie réunie : l'inspecteur la traite comme UNE copie** : un seul champ Élève, une seule Production (ou « Jeton de reprise » de telle production), écrits sur tous ses fichiers. L'en-tête dit « Copie de 3 fichiers ».
4. **Confirmer** : la fenêtre liste les copies qui seront créées, par exemple « [Élève] – Artefact 6, reprise – 3 pages ». Une copie réunie n'est jamais annoncée en doublon, et l'avertissement « Ajoutez le DA au nom du fichier » ne paraît plus quand l'élève a été choisi dans l'app.
5. **Importer** : l'app assemble les fichiers en un seul PDF (ce qu'elle fait déjà pour un groupe Léa) et, pour une reprise, rattache le jeton à cette copie unique.

Critère de réussite (Grégoire, 5 nov.) : **après l'import, aucun passage par « Modifier » n'est nécessaire.**

## Ce que ça demande au code (pour la consigne, à remesurer par Claude Code)

- Un geste qui **pose la clé de regroupement** (`groupeDocumentId`) sur les fichiers cochés de la file d'attente, et qui recopie l'élève, la production et `estReprise` sur tout le groupe. Tout l'aval sait déjà traiter un groupe (colonne « Originaux », `assemblerPDFGroupe`, doublons, jeton).
- L'inspecteur reconnaît un groupe et écrit sur tous ses fichiers ; changer l'élève d'un fichier groupé change celui du groupe.
- La confirmation ne compte plus en doublons les fichiers d'un même groupe (déjà vrai) et ne réclame plus le DA dans le nom quand l'élève est posé.

## Ce qui est RETIRÉ (zéro dette)

- « Grouper » et « Assemblage auto » des Réglages spécifiques : ils n'ont aucun effet aujourd'hui (rien ne lit ce qu'ils écrivent). Les Réglages spécifiques gardent les seuls réglages d'image.
- « Renommer pour distinguer » pour des fichiers réunis : il n'aura plus de raison d'être (à remesurer pour les vrais doublons entre copies différentes).

## Ce qui reste hors de ce lot

- L'étiquette ★ d'une reprise rangée au bout du carrousel, loin de l'original (ergonomie d'Annoter) : petit lot à part, si tu le veux.
- Aucune détection automatique de « photos qui vont ensemble » sans DA : recommandation de Cowork, pour ne jamais réunir par erreur deux copies d'élèves différents.

## Ajouté le 5 nov. à 6 h 55 (demande de Grégoire)

- « Balance des blancs » est une pipette sans mode d'emploi à l'écran (audit, constat 13) : quand l'outil est armé, une ligne dit quoi faire. Mot proposé : « Touche une zone blanche de la feuille. » Et le banc vérifie qu'un réglage posé avant l'import se retrouve dans le fichier importé, reprise comprise.
- **Icônes (choix de Grégoire, 7 h 04)** : la pipette sur le bouton « Balance des blancs » (`plans de travail/icones-proposees/pipette-bouton.svg`) ; la cible à coins et croix centrale comme curseur quand l'outil est armé (`plans de travail/icones-proposees/cible-curseur.svg`), point chaud au centre de la croix. Venues de SVG Repo : **licence à vérifier avant de les livrer** ; trait plus fin que les icônes Icons8 de l'app, accepté par Grégoire. **Pipette remplacée à 7 h 08** (choix de Grégoire) par une silhouette pleine et plus simple, lisible à petite taille et plus proche des icônes Icons8 ; même nom de fichier.

## À trancher par Grégoire

1. ~~Le parcours ci-dessus te va-t-il ?~~ **Validé par Grégoire le 5 nov. à 6 h 55** (« ce parcours me convient tout à fait »).
2. Les mots : « Réunir en une copie », « Copie de 3 fichiers », et la ligne de la confirmation.
