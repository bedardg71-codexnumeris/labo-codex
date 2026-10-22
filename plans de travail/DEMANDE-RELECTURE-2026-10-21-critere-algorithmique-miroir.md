# Demande de relecture – Le critère algorithmique, étape 1 : le miroir

> Claude Code, jeudi 22 octobre 2026, 7 h 30. Consigne : `CONSIGNE-LOT-2026-10-21-critere-algorithmique-miroir.md` (écrite sur `90809966` ; ses contraintes d'horaire déclarées périmées par Cowork le 22 ; les numéros de ligne remesurés sur `941c2491`). Un commit sur `main`, non poussé, sans numéro de version ni verdict complet.

## Ce qui a changé

1. **Le bloc « Essai sur des copies fictives »** se trouve dans la carte « Formule », sous « Formule appliquée ». Mesure du placement : c'est la seule carte du gabarit qui n'est jamais repliée, c'est elle que l'essai met à l'épreuve, et ses réglages sont juste au-dessus. Une ligne par copie : la copie (« 0 erreur, 500 mots »), la note (« 30/30 (100 %) », virgule, `formaterNoteNombre` et `formaterNotePourcentage`), puis « L'élève lira : » et la phrase. Le bloc est en lecture seule : aucun contrôle, aucun handler.
2. **Un module pur, `js/miroir-algo.js`**, fabrique les copies et les résultats. Il appelle `formulesAlgo.calculer`, `enoncesAlgo.enonce` et `mentionPonderee` (comme `calculerNoteAlgorithmiqueSimple`), et `projectionAlgo.calculer`. Aucune formule n'y est recopiée. La note affichée est celle que l'évaluation retient : le pourcentage borné (`pctBorne`, gardé sous `pourcentage`), ramené à la pondération.
3. **La somme pondérée a une seule définition**, `codesAnnotation.sommePonderee(grille, compteurs)`. `travauxOutils.sommePondereeErreurs` (Annoter) lui délègue désormais. Le miroir la lit aussi.
4. **Le miroir suit les réglages.** Le modèle, ses paramètres, la projection, les sous-critères et les phrases passent par `_redessinerCible`, comme avant. La pondération du critère, elle, ne redessine pas le gabarit : le miroir se refait en place (`suivreMiroirAlgo`), en création comme en modification, sur le modèle de `suivrePointsDAbord`.
5. **Les mots du miroir** passent tous par `miroirAlgo.libelles(critere)`. Ce sont les mots de l'écran actuel ; aucun ne nomme une discipline.
6. **Point 7** : « Aucun sous-critère pour l'instant : ajoute les tiens, ou pars de la liste du français écrit. »

Jetons anti-cache : `codes-annotation.js`, `grilles.js`, `travaux-outils.js` et `styles.css` passent à `20261021b` (jamais servis) ; `miroir-algo.js` est neuf, à `20261021a`. Il est chargé après ses registres et avant `grilles.js`. La sentinelle anti-cache est verte.

## La règle des copies (décidée seul, écrite en tête de `miroir-algo.js`)

- **L'étendue** : la longueur de référence de la **projection** si elle projette, sinon le **facteur** de la formule, sinon dix fois le **ratio visé**, sinon aucune (la copie est « sans nombre de mots » et l'évaluation recevrait 0).
- ⚠ **La projection passe avant le facteur, et c'est mesuré.** Une copie dont la longueur égale le facteur perd un point par erreur, quel que soit le facteur : `pondération − E × f ÷ f`. Changer le facteur ne changerait alors aucune note. **Sans projection** (c'est le cas d'un critère neuf), le facteur reste la seule longueur que la grille donne : changer le facteur change la longueur des copies, pas leurs notes. C'est ce que dit la formule. L'étape 2, qui nommera l'étendue, pourra offrir une longueur à soi.
- **Aucune** : 0 erreur. **Beaucoup** : le premier nombre d'erreurs où la note touche le plancher, cherché par la formule elle-même ; pour le ratio visé, qui n'y arrive jamais, le premier nombre où la note tombe à la moitié. **Quelques-unes** : le quart de « beaucoup », au moins 1.
- **Pondérée** : seulement si le critère tire ses codes de ses sous-critères et qu'un code ne pèse pas 1. Elle porte autant d'erreurs que « quelques-unes », partagées entre le code le plus lourd et le plus léger.
- **Sans pondération du critère**, aucune copie ; une phrase invite à en donner une (un critère neuf naît à 0).

## Le stock

Rien n'est écrit, ni dans la grille ni ailleurs. Le rendu du gabarit écrivait déjà la grille avant ce lot (mesuré : banc E.a, avec et sans miroir). Le miroir n'y ajoute rien.

## Bancs

**Vitest**, `sentinelle-miroir-critere-algo.test.js`, 17 essais sur deux disciplines fictives (« Français écrit », « Unités et chiffres significatifs ») :
- la note de chaque copie est celle de `calculer`, pour les trois modèles (essais A) ;
- les copies suivent la longueur de référence et le facteur (essais B) ;
- la copie pondérée porte « (5,5 une fois pondérées) » et sa note suit la somme (essais C) ;
- un critère gelé ne bouge pas (essais D) ;
- le rendu dans la carte « Formule », en création comme en modification, sans « français » en chimie (essais E) ;
- l'ordre de chargement dans `index.html` (essai F).

Deux bancs existants changent pour suivre la phrase du point 7. Dans `critere-algorithmique-etape-0.test.js`, le nom de liste « la liste du français écrit » est retiré du texte avant le contrôle, comme l'est déjà le bouton ; tout autre « français » rougit encore.

**WebKit**, `critere-algorithmique-miroir.spec.js`, 3 essais :
- une grille neuve : le bloc paraît, la pondération le remplit en place, et le facteur change une note une fois la projection réglée ;
- à 820 px, en chimie : la copie pondérée paraît, sans « français » et sans défilement de côté ;
- une grille enregistrée : la pondération refait le miroir.

**Break-tests** (chaque fois, code restauré et vérifié par `cmp`) :

| Ce qui est cassé | Essais qui rougissent |
|---|---|
| une note en dur | A.a, A.b, E.a |
| une longueur de 500 en dur | B.a à B.d, C.a |
| la somme sans les poids | C.a, E.b, et le S.a d'Annoter |
| `suivreMiroirAlgo` retiré de la création | WebKit 1 |
| `suivreMiroirAlgo` retiré de la modification | WebKit 3 |

**Ensemble** : Vitest complet vert, 796 fichiers, 9 386 essais. Les specs WebKit de Grilles, du barème, des codes, du texte troué et du critère algorithmique sont vertes : 73 essais, dont les deux premiers du miroir ; le troisième, ajouté pendant `/fin-de-session`, est vert seul. `/fin-de-session` a été lancé avant le commit, sans le verdict complet : l'audit statique ne relève aucun motif, et aucune zone protégée n'est touchée.

Captures : `captures-2026-10-22-critere-algorithmique-miroir/miroir-1440-francais.png` (carte « Formule », projection à l'EUF, 900 mots) et `miroir-820-chimie.png`.

## Ce que j'ai mesuré en chemin

- **« … pour 0 mots. »** Sous « Pénalité fixe par erreur » et sans projection, la copie est sans étendue. L'élève lirait « Ta production contient 30 erreurs pour 0 mots. » : c'est ce que l'évaluation écrit déjà quand le champ des mots reste vide. Le miroir le montre, il ne le crée pas. Je propose *inscrire et continuer*, dans l'étape 2 du plan (une étendue « ou rien »), sans entrée au BACKLOG : aucun symptôme n'a été vécu.
- **Une seconde somme pondérée** vit encore dans `_calculerScoreAlgoCategories` (`evaluation-calcul.js`, mode Catégories). Elle lit `sc.ponderation`, avec 1 en repli. Je n'y ai pas touché : c'est le mode sans écran de #1133. *Commenter et oublier*, sauf avis contraire.
- `copiesExemple` garde sa copie « 3 erreurs, 300 mots » (`evaluation-projection.js`). Le plan la place à l'étape 1, mais elle ne s'affiche nulle part : elle ne sert que quand rien ne projette, et la ligne d'aperçu ne se rend que sous un palier. Le miroir ne la lit pas. Je ne l'ai pas retirée (un banc existant la vérifie). À trancher.

## Ce que je demande à la relecture

1. La règle des copies, surtout la priorité de la projection sur le facteur, et ce qu'elle implique sans projection.
2. Les mots que l'enseignant lit dans le bloc (titre, phrase d'introduction, « la note touche le plancher », la phrase sans pondération) : je les ai écrits seul.
3. Le tableau « Où en est le plan » : je n'y ai pas touché (modifié par Cowork, il part tel quel dans le commit).
