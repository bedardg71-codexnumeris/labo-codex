# CADRAGE — Ce que vaut un travail non remis dans la note du cours, famille par famille

> **Écrit le 5 septembre 2026 en soirée, par Cowork, avec Grégoire.** Né de la règle #706
> (1.122.0 : un brouillon ou une portée nulle n'entre pas dans la note du cours) et de la
> conséquence nommée dans le code : une évaluation vide à 0 ne pèse plus 0 dans une moyenne.
> **À exécuter après le 14 septembre**, avec les constats moyens du second audit. Pas une consigne.

## La règle, dans les mots de Grégoire (5 septembre)

*« Ça dépend de la pratique de notation. Habituellement, dans une pratique sommative
traditionnelle, si un travail demandé n'est pas remis, il compte pour zéro. Mais dans une
pratique alternative où l'on prend uniquement les meilleures notes, si le nombre minimum de
travaux est rempli, le zéro ne compte pas. C'est donc propre à l'utilisateur. »*

⮕ Ce n'est donc **pas une règle de moteur** (comme #706) mais une **règle par famille**, que la
pratique configurée doit porter et dire.

## Ce qui est mesuré, et ce qui ne l'est pas (5 septembre)

- **Mesuré** : un statut « non remis » existe sur l'évaluation (`statutRemise === 'non-remis'`,
  `grep -rn "non-remis" js/`) ; le profil (`profil-etudiant-sections-affichage.js`) et les
  snapshots (`snapshots.js`) le lisent. Un non-remis n'a donc pas besoin d'une évaluation vide
  pour exister ; la conséquence de #706 sur l'évaluation vide n'est pas une régression pour lui.
- **Non mesuré** : ce que chaque famille FAIT de ce statut dans la note du cours.
  `grep -n -i "non-remis\|non remis" js/pratiques/pratique-sommative.js` rend zéro ligne le
  5 septembre — un grep vide n'est pas une preuve ; c'est la première mesure à faire.

## Ce que le cadrage devra établir

1. **La mesure** : pour les quatre familles (SOM, STD, SPE, DEN) et les deux systèmes de calcul,
   qu'arrive-t-il à une production demandée sans évaluation, et à une évaluation portant
   `statutRemise: 'non-remis'` ? Nombre attendu à la main, nombre obtenu, sur les élèves de banc
   du second audit.
2. **La règle, par famille**, à faire arrêter par Grégoire à partir de la mesure :
   SOM → le non-remis compte zéro (position habituelle) ; STD → ignoré si le nombre minimum de
   travaux est atteint, sinon ? ; SPE et DEN → à dire.
3. **Où la règle vit** : dans la configuration de la pratique (donc réglable par le collègue,
   « propre à l'utilisateur »), pas dans le code ; et ce que le profil et l'export disent quand
   un non-remis a compté zéro ou a été ignoré.
4. **Le stock** : les non-remis déjà enregistrés chez les gens ne bougent pas ; on mesure, on
   propose (« tarir n'est pas réparer »).

## Ce qui n'appartient qu'à Grégoire

La règle de chaque famille (point 2), et les mots que le collègue lit (point 3).
