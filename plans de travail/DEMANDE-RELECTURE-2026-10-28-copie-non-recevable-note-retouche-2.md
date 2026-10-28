# Demande de relecture – La seconde retouche de « Une copie non recevable vaut ce que la règle dit » (#1175, 28 octobre 2026)

> Écrite par Claude Code le mercredi 28 octobre 2026, sur `main`. Verdict : `VERDICT-RELECTURE-2026-10-28-copie-non-recevable-note.md`, section « Relecture de la retouche » (Cowork, 7 h 17). Code : `301da325`. Pas de release, pas de verdict Playwright complet, pas de push.

## En bref

Les trois endroits nommés par la relecture ne montrent plus les niveaux d'une copie non recevable. Un quatrième, de même nature, a été mesuré en chemin et tenu dans le même lot (§ 1.4) : la décision est la même, et le code venait d'être ouvert pour la Liste. Rien ne s'écrit dans la copie ; retirer le statut fait tout revenir.

## 1. Ce qui change

| Où | Avant | Après | Preuve au code |
|---|---|---|---|
| Formulaire, cartes des critères | les menus montrent E et M (et, selon le type, la ligne du calcul algorithmique, les points, le barème) | les cartes des critères sont masquées sous la classe du panneau ; l'avis « Travail non recevable » et le libellé restent | `styles.css:26444-26449` |
| Formulaire, avis des critères hors grille (#652) | « Analyse (M) » d'un critère retiré de la grille | masqué sous la même classe | `styles.css:26448` |
| Liste, colonne du niveau | « M » | « -- », comme la note ; sans rang au tri par niveau | `js/liste-evaluations.js:1143, 1327` |
| Liste, badge « Reprise » d'une copie dont l'originale est non recevable | « (était M · 87,5 %) » | « (était Non recevable (Plagiat)) » | `js/liste-evaluations.js:1113, 1333` |
| Bilan d'une copie postérieure, PDF et écran | « Tu as progressé en Structure », « Progrès : M → E » lus sur la copie non recevable | elle n'entre pas dans l'historique ; la règle est unique (`historiqueAnterieur`), donc le PDF et l'écran suivent ensemble | `js/synthese-retroaction-data.js:1585` |

Trois précisions.

- **Masquées, pas vidées.** J'ai masqué la carte entière plutôt que le seul menu : la ligne du calcul algorithmique (« Niveau : M »), les points d'un critère analytique et son barème portent aussi un niveau, et un menu caché sous son étiquette « Niveau (modifiable manuellement) » aurait laissé une étiquette orpheline. Les noms des critères partent donc avec leurs cartes ; ils se lisent sur le PDF, avec les commentaires.
- **Source et stock.** Tout se lit au rendu, sur le statut : les copies déjà marquées suivent sans écriture.
- **#1176** : le septième site en est retiré (`BACKLOG.md`, l. 134) ; les six du dépistage restent.

## 2. Les tests

- **Sentinelle** `tests/unit/sentinelle-copie-non-recevable-affichage-28-oct.test.js` : 13 → **19 essais**, chacun avec son témoin recevable.
  - `historiqueAnterieur` écarte « plagiat » et « ia », garde « recevable » et « soupçon » ;
  - le PDF de la copie suivante ne dit plus « Tu as progressé en Structure » (le témoin, oui) ; aucune écriture ;
  - la Liste réelle (`construireLignesEvaluations`, `genererLigneHTML`) : aucune cellule « M », deux « -- » ; le badge de reprise ;
  - le CSS (cartes et avis hors grille visés, l'avis « Travail non recevable » non) ; les menus gardent E et M sous la classe, et après.
  - L'essai CSS de la première retouche suit la règle allongée (↻).
- **Break-test : 7 mutations, 7 rouges** (le filtre de l'historique, la donnée et le rendu de la colonne, le niveau et la note du badge, les deux lignes CSS), arbre restauré et contrôlé par sha256.
- **Spec WebKit du lot** (`copie-non-recevable-note-28-oct.spec.js`, ↻) : statut posé, aucun menu visible ; statut retiré, E et M reviennent ; reposé, masqués ; la ligne de la Liste n'a aucune cellule « M » et deux « -- ». Le texte visible du panneau, journalisé, ne porte aucun niveau. Break-test : deux mutations (la règle CSS des cartes, la colonne), deux rouges, fichiers restaurés.
- **Sentinelles d'autres lots** :
  - `genererLigneHTML` passait de 41 à 42 : la cellule du niveau est extraite dans `_celluleNiveau`, elle descend à 39 ; le cliquet est abaissé (`complexite-fonctions-30.json`).
  - #562 (échappement de la Liste) : `_celluleNiveau(ligne)` entre dans la liste fermée, et **son corps est scanné** avec les deux autres fonctions. Break-test : `echapperHtml` retiré dans `_celluleNiveau`, rouge.
- Jetons anti-cache de quatre fichiers (`styles.css`, `liste-evaluations.js`, `synthese-retroaction-data.js`, `evaluation-sauvegarde.js`, dont seul le commentaire change).
- **Vitest** depuis `tests/` : **839 fichiers, 10 044 essais, verts**.
- **Playwright ciblé** (WebKit) : la spec du lot, #959, lot C (verrouiller), le parcours sommatif du 24 sept., #940 (bilan), #583 (repères), lot 2c de l'Aide : **20 verts**. **La suite complète n'a pas tourné** : pas de verdict sur HEAD.

## 3. Trouvailles

- **Une reprise naît avec le statut d'intégrité de son originale.** `appliquerJetonReprise` (`js/evaluation-jetons.js:498`, la copie aux l. 571-593) copie l'originale par `structuredClone` et retire une liste de champs ; `statutIntegrite` n'y est pas, et je n'ai trouvé aucune remise à zéro ailleurs. Une reprise accordée après un plagiat serait donc « Non recevable (Plagiat) » jusqu'à ce que l'enseignant·e change le menu. Mesuré au code seulement, pas à l'écran ; aucun symptôme vécu, donc **non inscrit** (règle du 24 août). À Cowork d'en disposer : si c'est voulu, rien à faire ; sinon, c'est un champ à ajouter à la liste.
- **La colonne « Statut » de la Liste dit « 0 »** pour une copie non recevable (`liste-evaluations.js`, `affichageNiveau`), à la place de la pastille. Ce n'est ni un niveau ni la note de la copie (c'est la valeur de la règle en sommative, pas en spécifications ni en standards). Hors du lot ; issue 3 tant que personne ne s'y trompe.

## Pour Grégoire

Rien n'est à trancher dans ce lot. Une supposition, nommée : sur le formulaire, une copie non recevable n'affiche plus du tout ses critères, noms compris (§ 1). Si tu préfères garder les noms visibles sans leurs niveaux, c'est une retouche de CSS.
