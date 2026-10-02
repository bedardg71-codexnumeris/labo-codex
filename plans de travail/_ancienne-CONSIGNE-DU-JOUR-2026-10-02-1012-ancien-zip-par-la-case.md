# Consigne du jour – l'ancien fichier `.zip` ouvert par la case ne fait plus perdre de copies (#1012, suite)

> Écrite par Cowork le 2 octobre 2026 à 6 h 54 (Toronto, mesurée par `date`). Remplace la consigne de release d'hier, 18 h 57, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-01-1012-release-1.174.0.md`. L'ordre des chantiers du 1er octobre, 13 h 02, ne change pas : ce lot est dans le point 1 (le codex, jusqu'à « clos »).

## Où on en est

1.174.0 est en ligne depuis le 1er à 20 h 05. **La porte de l'avertissement n'a pas pu voir la fenêtre** : le 2 octobre à 6 h 50, en fenêtre privée de Chrome, le codex de Grégoire (1,22 Go, écrit le 1er à 18 h 50) s'est ouvert en entier, « Recharger la page », sans le mot « incomplet » (sa capture). La porte n'a pas échoué ; ses rangées 1.2 à 1.4 attendent un cas réel, Grégoire ne fabrique pas de données pour elles. La rangée 2.1 reste à voir, sans échéance.

**Relevé par Cowork sur cette capture** : la fenêtre d'une ouverture complète dit encore « Le fichier ZIP d'origine reste dans Fichiers — tu peux le supprimer pour récupérer de l'espace ». Ce fichier est le codex de l'usager, et le mot arrêté est « codex ». Ce sont des mots : décision de Grégoire, plus tard.

Grégoire a dit « oui » à ce lot à 6 h 54.

## D'abord

Inscris dans `PORTES-TERRAIN-2026-10-01-1012-avertissement.md`, `RELAIS.md` et `OU-EN-EST-ON.md` le résultat de la porte ci-dessus, et sous #1012 le relevé de la capture (issue 2). Commite avec eux les fichiers de Cowork qui traînent dans l'arbre.

## Le défaut, tel que tu l'as mesuré

Ta demande de relecture d'hier, § 6 : un codex A tenu, puis un ancien `.zip` avec copies ouvert par la case « Ouvrir un Codex… », tout coché. La liste des copies de l'espace est **remplacée** par celle du fichier ; les copies de A n'ont plus d'entrée, leurs fichiers restent au magasin sans rien qui les désigne ; « Mettre à jour le codex » écrit ensuite dans A un codex d'une copie au lieu de trois, sans fenêtre. **Lu par Cowork ce matin** (`js/import-export.js`, l. 2932 à 2940 sur `main`) : la case des copies fait `db.set(cleFT, fichiersTravaux)` pour chaque clé de liste du fichier. Remesure avant d'ouvrir : vérifie que le défaut vit encore là.

## La règle (décision de Cowork, technique ; Grégoire en est informé)

**Les copies d'un fichier importé par la case s'ajoutent à celles de l'espace. Aucune copie déjà là ne perd son entrée.** C'est dans la ligne de sa limite du 20 septembre : rien ne s'efface de façon irréversible.

- Une copie du fichier dont l'identifiant n'existe pas dans l'espace : elle entre, avec son fichier.
- Une copie dont l'identifiant existe déjà : dis ce que le code fait aujourd'hui pour l'entrée et pour le fichier au magasin, propose la règle la plus sûre (celle qui ne détruit rien de ce qui est dans l'espace), et applique-la. Si aucune règle n'est sans perte, arrête-toi et rends le cas à Cowork.
- Aucun mot neuf à l'écran. Si l'aperçu de l'import ou son résumé disent « remplace » là où il ajoute désormais, relève-le dans ta demande sans y toucher : ce sont des mots.

## Ce que tu fais, sur une branche

1. **Reproduis par le geste**, avant de corriger : la case, l'ancien `.zip`, puis « Mettre à jour le codex » ; ce que reçoit le fichier, combien de copies.
2. **Corrige** selon la règle.
3. **Regarde autour, sans corriger** : parmi les autres cases de cet import, lesquelles remplacent une liste dont quelque chose dépend (les annotations des copies, les évaluations liées à une copie) ? Dis ce qui devient orphelin, mesuré ou lu. Inscris, issue 2.
4. **Source et stock** : chez qui a déjà fait cet import, des copies sont au magasin sans entrée. Ne répare rien d'office. Dis seulement si on peut les reconnaître (les dix fichiers sans liste que ta sonde a trouvés chez Grégoire hier à 17 h 03 en sont-ils ? ne relis pas son espace : dis ce qu'il faudrait pour le savoir).
5. **La preuve** : un banc par le geste (après l'import, les copies de l'espace sont toujours dans la liste, celles du fichier aussi ; la mise à jour du codex les écrit toutes), un témoin (l'import d'un fichier sans copies ne touche pas la liste), des mutations rouges, Vitest complet.
6. **Arrête-toi à la demande de relecture** : `plans de travail/DEMANDE-RELECTURE-2026-10-02-1012-ancien-zip-par-la-case.md`, avec une proposition de ligne pour les Nouvelles. Ni release, ni push du code. Ce chemin écrit les données de l'usager : relecture croisée avant toute release.

## Ce que tu ne fais pas

La sélection exportée sans ses copies, la copie vraiment perdue, les mots de la fenêtre d'une ouverture complète : chacun attend les mots de Grégoire.

## Ce que tu rends

À Grégoire, trois lignes en gestes : ce qui est codé ; ce que tu as trouvé autour (point 3) ; ce qui l'attend. Ce que tu as supposé, en une ligne.
