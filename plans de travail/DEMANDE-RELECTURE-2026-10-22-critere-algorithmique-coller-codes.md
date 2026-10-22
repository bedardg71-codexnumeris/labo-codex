# Demande de relecture – étape 5 du critère algorithmique : coller sa liste de codes

> Claude Code, jeudi 22 octobre 2026, sur `main`, un commit non poussé après `9da84bed`. Consigne :
> `CONSIGNE-LOT-2026-10-22-critere-algorithmique-coller-codes.md` (option A, tranchée par Cowork). Pas de
> verdict complet, pas de version.

## Ce qui est fait

- **La palette** gagne un groupe « Les codes » : Code, Nom du code, Poids, Commentaire. Dans un tableau, un
  morceau rejoint le code de sa rangée ; dans un texte brut, le dernier code ouvert. Une « Suite » prolonge
  un nom ou un commentaire (`materiel-dissection-lecture.js` : `lireMorceauDeCode`, `codesCompris`,
  `destinationsCodes`).
- **La lecture** montre une rangée par code (`tableCodes`, tout en `textContent`). Avec au moins un morceau
  du groupe, la zone de création ne crée plus de grille : elle demande « Où vont ces codes ? » et offre
  « Ajouter ces codes » (`materiel-dissection.js`, `rendreCodes`).
- **L'écriture** (`materiel-creation.js`, `ajouterCodes`, l'exception nommée à « aucun objet existant n'est
  modifié ») pose les codes comme sous-critères `{ id, code, nom, ponderation, retroaction }`, la forme de
  `ajouterSousCritere`. Le droit d'écrire se vérifie de nouveau dans la file de `db.modifier`. Après l'ajout,
  le critère a des codes : il ne se choisit plus, et une liste collée deux fois ne remplace rien.

## Mes suppositions

1. **« N'a pas encore de codes »** veut dire : le premier critère algorithmique de sa grille (#1132), marqué
   `codesSousCriteresSeulement`, sans aucun sous-critère (même un sous-critère de pondération 0). Sans la
   marque, le critère reçoit les dix codes du français écrit : refusé, motif dit. **Conséquence** : les
   critères créés avant le 21 oct. (ceux de Grégoire) ne peuvent pas recevoir de liste.
2. Une liste de codes se colle **seule** : mêlée à des étiquettes de grille, elle est refusée.
3. Un poids absent vaut 1 ; un nom ou un commentaire absent reste vide. Les commentaires de plusieurs
   morceaux sont gardés, un par ligne.
4. Les quatre étiquettes **reprennent les surligneurs** du critère, de l'élément observable, de la
   pondération et du descripteur, sans variable de couleur neuve.
5. La confirmation s'affiche **sur place** ; la dissection reste ouverte. Le choix du critère n'entre pas
   au brouillon.
6. **Tous les textes de l'écran sont provisoires** (étiquettes, aides, motifs, refus, confirmation), à
   valider par Grégoire.

## À regarder

- **La notation** : poser des sous-critères sur un critère algorithmique fait passer son évaluation au mode
  catégories (`evaluation-calcul.js`, `aCategories`). C'est déjà ce que donne la saisie des codes à la main
  dans Grilles de critères : la liste collée ne produit aucun état neuf.
- **L'échappement** : éprouvé dans la lecture de la dissection et dans Grilles de critères (spec WebKit,
  `<img onerror>` dans le nom et le commentaire). La palette d'Annoter échappe le nom
  (`travaux-outils.js:1417-1419`, lu) ; la rétroaction de l'élève est du texte (`evaluation-retroaction.js:230`,
  lu). Ces deux derniers chemins ne sont pas éprouvés par un banc neuf.

## Preuves

- Vitest complet : 9 427 essais, 800 fichiers, vert. Neuf : `tests/unit/critere-algorithmique-coller-codes.test.js`
  (13 essais, une rédaction et des calculs de chimie). Break-tests faits :
  - la garde des sous-critères retirée → D.a, D.b, E.b rouges ;
  - la vérification dans la file retirée → E.b, E.c rouges ;
  - le poids absent non remplacé par 1 → L.a, R.b, R.c rouges ;
  - le commentaire en `innerHTML` → la spec WebKit rouge.
- La sentinelle de complexité (règle 2) a rougi sur `lireMorceau` (18) : la branche des codes en est sortie
  (`lireMorceauDeCode`), retour à 14.
- WebKit, vertes : `critere-algorithmique-coller-codes` (neuve, iPad 820 px : cibles de 44 px, aucun débord),
  et les 14 specs de la dissection et d'« Apporter mon matériel ». `materiel-dissection-1` comptait douze
  étiquettes : seize maintenant.
- Non éprouvés : Safari réel, l'iPad au doigt, Annoter avec les codes collés.
