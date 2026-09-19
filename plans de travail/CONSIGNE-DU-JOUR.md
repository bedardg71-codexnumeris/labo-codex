# Consigne suivante — ce que l'élève lit une fois sa note calculée (#701, #702, #703, #704, #705, #686)

> Écrite le 19 septembre 2026 vers 15 h 50 (Toronto), par Cowork. **Toutes les décisions sont prises** : #701, #704, #705 par Grégoire le 17 sept. à 13 h 42-43 (`plans de travail/DECISIONS-2026-09-17-apres-midi.md`) ; **#703 par Grégoire le 19 sept. vers 15 h 45** : « l'éditeur le dit et propose d'appliquer le type aux critères existants » (écartée : faire suivre le type de la grille d'office, qui changerait en silence la note d'évaluations déjà faites cet automne).
> **Condition de départ** : `origin/main` porte 1.148.0 (`09f1c6ef` ou plus récent). Une autre session tient le lot « un groupe = (cours, numéro) » dans `js/trimestre-v2-etudiants.js` : **aucun fichier en commun avec ce lot**. Travaille dans un worktree si l'arbre principal est pris ; fusionne après son push, rebase d'abord. Archive `CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-19-<son sujet>.md` et renomme ce fichier en `CONSIGNE-DU-JOUR.md`.
> ⚠ **Arbre partagé** : les quatre fichiers de l'autre travail restent hors de l'index ; jeton d'`interpretation-config.js` à `20260910c`.
> **Identifiant** : relis « Dernier ID utilisé » (#923 à l'écriture) et `grep` les deux registres avant d'en prendre un.
> **Notes d'A2025 et d'H2026 : ne se rouvrent pas.** Seul l'automne 2026 compte.

---

## 1 · Ce que Grégoire verra

Le niveau imprimé sur la rétroaction et le PDF de l'élève correspond au pourcentage arrondi. Une copie sans faute reçoit sa note. Une évaluation faite avant l'ajout d'un critère à sa grille conclut normalement. Aucune rétroaction ne porte « -- » comme niveau. Un critère « Français écrit » reçoit son texte même quand sa grille est introuvable. Et quand il passe une grille en « Analytique » alors que des critères existants n'ont pas de type, l'éditeur le lui dit et propose de le leur appliquer.

## 2 · Mesuré par Cowork (lecture de `main` après 1.148.0) — à remesurer

Les sites nommés par les fiches existent encore :
- `js/evaluation-calcul.js` : repli « Fallback niveau » de `calculerNote` (≈ l. 1384) ; garde `if (mots === 0 || totalErreurs === 0)` (≈ l. 586) ; `_critereDeGrille` (≈ l. 462, appelée l. 202, 475, 550, 743) ; `porteeDepuisEvaluation` (≈ l. 907, lue par `js/synthese-retroaction-data.js:143`).
- `js/grilles.js` : `modifierTypeGrilleHandler` (≈ l. 6104) ; `typeParDefautCritere` (cité ≈ l. 3232 par la fiche #703, non relu).
- #686 : chemin de correction déjà écrit dans la fiche (`critereNom` porté par l'évaluation, `evaluation-chargement.js` ≈ l. 1440).

## 3 · Ce qui est attendu

1. **#701 — arrondir à l'entier avant de chercher le niveau** (74,5 → 75 → niveau supérieur ; 74,4 reste). Une seule fonction de recherche du niveau, lue par les trois chemins (global, algorithmique, analytique). Dis si l'arrondi ferme tous les trous des échelles par défaut ; mesure s'il en reste sur une échelle aux bornes non contiguës.
2. **#702 — « -- » n'entre plus en base comme niveau.** S'il reste un trou après l'arrondi (échelle aux bornes espacées), l'algorithmique applique la même règle que le global (niveau le plus proche) — **décision de Cowork, en ligne avec #701 : dis-le dans le rapport**. Le stock (évaluations déjà enregistrées avec « -- ») n'est pas réécrit : compte-le sur le pack démo et nomme-le.
3. **#703 — l'éditeur de grille dit et propose.** Quand le type de la grille change et que des critères existants n'ont pas de type, un message sous le menu les compte et offre un bouton qui leur applique le type de la grille ; rien ne change sans ce geste. Les critères qui ont DÉJÀ un type ne sont pas touchés. **Avant d'écrire, MESURE** : appliquer le type change-t-il la note affichée (profil, liste, PDF, export) d'évaluations déjà enregistrées ? Si oui, le message dit combien d'évaluations en seront recalculées. **Mots proposés par Cowork** (lus par des enseignant·es, relus par Grégoire à la relecture) : « 3 critères de cette grille n'ont pas de type : ils se calculent encore en holistique. » ; bouton « Les passer en analytique » ; si des évaluations en dépendent : « 12 évaluations déjà faites avec ces critères seront recalculées. »
4. **#704 — zéro erreur = note complète, dans les deux modes.** Séparer la garde : `mots === 0` reste (copie sans texte), `totalErreurs === 0` calcule. Vérifie que le registre `ratio_cible` dit déjà « aucune erreur : la note est complète ». Stock : une évaluation déjà enregistrée sans niveau pour cette raison est nommée, pas réécrite.
5. **#705 — chaque évaluation se juge contre SA grille.** `porteeDepuisEvaluation` prend comme référence les critères que l'évaluation portait (`criteres[]`) quand la déclaration manque ; le PDF conclut. Un critère ajouté depuis est **signalé comme non couvert à l'écran de l'enseignant·e** (règle « conserver et signaler » de #652). ⛔ **Si le signalement doit paraître sur le PDF de l'élève, arrête-toi et propose les mots** : ce sont des mots d'élève. Rejoue les trois cas du constat E-2.
6. **#686 — lire le nom que l'évaluation porte déjà.** Quand la grille est introuvable, l'appelant passe `{ nom: critereNom }` au lieu de `null`. Aucune grille réécrite.

## 4 · Arrêts

- Un chemin où l'arrondi ou la nouvelle portée change une note **déjà remise cet automne** sans geste de l'enseignant·e : arrête-toi, mesure sur le pack démo, dis combien et lesquelles.
- Tout mot neuf sur la rétroaction ou le PDF de l'élève : proposé, pas posé.
- Stock : aucune évaluation, grille ou critère réécrit par le code du lot (le bouton de #703 est un geste de l'utilisateur, pas une migration).

## 5 · Preuve

- Sentinelle Vitest sur les vraies fonctions : 74,4 / 74,5 / 89,5 / 59,5 sur les quatre échelles par défaut ; trou résiduel sur une échelle espacée (plus de « -- ») ; 0 erreur en catégories et en simple ; les trois cas E-2 ; grille introuvable → texte « Français écrit ».
- Banc WebKit par le vrai geste pour #703 : grille passée en « Analytique » avec des critères sans type → message et compte lus à l'écran ; bouton → types appliqués ; sans le geste, rien d'écrit. Et un PDF rendu pour une évaluation d'avant l'ajout d'un critère (#705) : il conclut.
- Mutations : l'arrondi retiré ; « -- » réadmis ; la garde réunie ; la portée relue sur la grille courante ; le nom de repli retiré ; le bouton qui applique d'office. Chacune rouge.
- Vitest complet depuis `tests/`. Verdict Playwright par `pousser.sh`, Cowork fermé. Porte terrain : aucune a priori (la machine voit tout) ; si le message de #703 déborde à 768 px, dis-le.
- Version : `minor` à ton jugement ; entrée de « Nouvelles » proposée, elle remonte à Grégoire par Cowork.

## 6 · Rapport

En gestes d'utilisateur : ce qui change pour l'élève qui lit son PDF, ce que tu as supposé, le compte de stock pour #702, #704 et #705, la mesure de #703 (des notes bougent-elles au geste ?), ce qui n'est pas mesuré, les chemins à commiter. Coche les six fiches avec leur « vérifié comment » ; `OU-EN-EST-ON.md`, `RELAIS.md`.
