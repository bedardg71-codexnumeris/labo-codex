# Consigne du jour – les quatre cases de l'import ne remplacent plus les données de l'usager (#1012, dernier lot du codex)

> Écrite par Cowork le 2 octobre 2026 à 10 h 33 (Toronto, mesurée par `date`), sur `main` à `3947a6e4` (1.174.2 en ligne). Remplace la consigne de la sélection, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-02-1012-selection.md`. Grégoire a dit « oui » à ce lot à 10 h 32. L'ordre des chantiers du 1er octobre ne change pas : c'est le dernier lot de code du point 1 (le codex, jusqu'à « clos »).

## Le défaut, lu par Cowork

Dans `executerImportSelectif` (`js/import-export.js`, l. 2894 à 2948 et 3065 à 3080 sur `main`), quatre cases font encore `db.set` avec la valeur du fichier : **« Étudiants »** (`groupeEtudiants`), **« Présences »** (`presences`), **« Notes »** (clé de case `evaluations` : `evaluations`, `evaluationsSauvegardees`, `notesEtudiants`), **« Annotations »** (`annotationsTravaux`). Tu l'as mesuré par le geste ce matin à 7 h 10 (ta demande de relecture de la case, § 5). Le geste par défaut aggrave le cas : « C'est ma propre sauvegarde » coche toutes les cases de données personnelles (`toggleDonneesPersoImport`). **Remesure avant d'ouvrir.**

## La règle (technique, tranchée par Cowork ; Grégoire en est informé)

La même que pour les copies, dans la ligne de sa limite du 20 septembre : **ce que le fichier apporte s'ajoute ; rien de ce que l'espace a ne perd son entrée ni n'est réécrit. Quand une même chose est des deux côtés, l'espace l'emporte.** « La même chose » se juge par son identité métier, pas seulement par l'`id` :

- **Étudiants** : un élève du fichier entre si son DA n'est pas dans le groupe ; sinon la fiche de l'espace reste telle quelle.
- **Présences** : un tableau de fiches (`saisie-presences.js`, l. 1034 à 1064). Une fiche du fichier entre si aucune fiche de l'espace n'a la même date, le même DA et le même cours (`coursId` absent = même cours, comme le fait `saisie-presences.js`) ; sinon celle de l'espace reste.
- **Notes** : une évaluation du fichier entre si son `id` n'est pas dans l'espace **et** si l'espace n'a pas déjà une évaluation pour le même élève, la même production et la même reprise. Mesure toi-même ce qui fait l'unicité d'une évaluation (reprises : `repriseDeId`, `jetonRepriseApplique`, ids `EVAL_REPRISE_`) et dis-le. **Aucune note de l'espace ne doit changer** : c'est la preuve première de ce lot. `evaluations` et `notesEtudiants` : je ne leur trouve aucun lecteur hors de l'import (lu, `grep`) ; mesure, et si ce sont des clés mortes, traite-les comme le reste (ajouter sans réécrire) sans rien retirer dans ce lot ; inscris leur retrait, issue 2.
- **Annotations** : une copie a une seule annotation (`obtenirAnnotationFichier` rend la première par `fichierId`). Une annotation du fichier entre si son `id` n'est pas dans l'espace **et** si aucune annotation de l'espace ne porte sur le même `fichierId` ; sinon celle de l'espace reste.

Si pour l'une des quatre aucune règle n'est sans perte, arrête-toi et rends le cas à Cowork. Ce qui toucherait au sens d'une note remonte à Grégoire par Cowork.

**Supposition de Cowork, dite à Grégoire** : un élève du fichier absent du groupe entre, puisque l'usager a coché « Étudiants ». Un élève retiré exprès du groupe pourrait donc revenir. Mesure comment l'application retire un élève (suppression ou statut) et dis ce que tu en vois ; ne change rien de plus.

**Aucun mot neuf à l'écran.** Les nombres du bilan disent ce qui est entré, comme pour les copies. Relève sans y toucher les mots qui mentent (« N date(s) de présences » compte des fiches, pas des dates).

## Ce que tu fais, sur une branche

1. **Reproduis par le geste**, avant de corriger, chacune des quatre cases : un espace semé, un ancien `.zip` qui a les mêmes choses et d'autres, tout coché par « C'est ma propre sauvegarde ». Ce que l'espace a perdu, compté.
2. **Corrige** selon la règle. Une fonction pure de fusion par famille (ou une seule paramétrée par la clé d'identité), testable en Vitest ; pas `fusionnerParIdentite`, qui renomme au lieu de garder.
3. **Regarde autour, sans corriger** : les cases qui remplacent et que l'écran annonce (« Configuration », « Cadre du trimestre ») ; « Groupe-cours », « Horaires », « Enseignants », qui remplacent sans le dire. Dis, lu ou mesuré, ce qu'une copie ou une évaluation y perd. Inscris, issue 2.
4. **Source et stock** : ce lot tarit la source. Chez qui a déjà fait cet import, ce qui a été remplacé est perdu ; dis seulement si on peut le reconnaître. Ne répare rien.
5. **La preuve** : un banc par le geste (après l'import, tout ce que l'espace avait y est, intact ; ce que le fichier apportait de neuf y est aussi ; aucune note de l'espace ne change ; la mise à jour du codex écrit le tout), des témoins (une case décochée ne touche rien ; le même fichier rouvert ne double rien), des mutations rouges, Vitest complet.
6. **Arrête-toi à la demande de relecture** : `plans de travail/DEMANDE-RELECTURE-2026-10-02-1012-quatre-cases.md`, avec une proposition de ligne pour les Nouvelles. Ni release, ni push du code. Ce chemin écrit les données de l'usager, notes comprises : relecture croisée avant toute release (règle 2).

## Ce que tu ne fais pas

Les copies d'un collègue (relevé du matin, § 5), `executerImportLocalStorageBrut`, les mots en attente de Grégoire : chacun a sa fiche.

## Ce que tu rends

À Grégoire, trois lignes en gestes : ce qui est codé ; ce que tu as trouvé autour ; ce qui l'attend. Ce que tu as supposé, en une ligne.
