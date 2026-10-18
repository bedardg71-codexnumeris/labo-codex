# Plan du jour – la dissection, dans « Apporter mon matériel », pour lundi

> Arrêté le dimanche 18 octobre 2026 à 7 h 17 (Toronto) par Grégoire et Cowork. Rencontre de la communauté de pratique : **lundi 19 octobre, 11 h**. Grégoire travaille toute la journée avec Cowork.
> Tenu par Cowork : il coche ici chaque étape finie, avec son commit.

## La décision de Grégoire (7 h 12 à 7 h 14)

- Sa porte terrain de 5 h 10 (relevé dans `PORTE-TERRAIN-2026-10-19-apporter-mon-materiel.md`) : l'assistant en sept étapes de la 1.203 l'a perdu. Dans ses mots : « Je ne sais pas où regarder, quoi lire et ce qui est attendu de moi. » **Il n'est pas présenté lundi.**
- Ce que les utilisateurs verront lundi : **la dissection**, mise au point ce matin dans une ébauche. L'enseignant colle sa grille, la voit telle quelle, et c'est LUI qui pose une étiquette sur chaque morceau ; l'application ne devine plus, elle lit ses étiquettes et montre la grille qu'elle en tire. Dans ses mots : « c'est l'intelligence de l'utilisateur qui est utilisée plutôt qu'une série de calculs ». « Dissection » est un nom de travail entre nous (« ça fait un peu cadavre ») ; l'onglet garde son nom, « Apporter mon matériel ».
- **Deux entrées, une seule destination** : la dissection produit les mêmes grilles, échelles et cartouches que les outils de Conception, qui restent la façon de créer (« nous allons garder les deux »).

## La référence de comportement

- L'ébauche : `Retours des testeurs/gregoire/PROTOTYPE-2026-10-18-dissection.html`, **hors git** (elle porte la grille Cornell de Grégoire, son matériel ; les bancs et l'exemple de l'application emploient des grilles **fictives** de même forme). Elle s'ouvre dans un navigateur ; ses fonctions `comprendre` et `lireCollage` sont la référence de la lecture.
- Éprouvée ce matin par Grégoire sur deux grilles réelles, lues juste : sa grille Cornell (des sections dont la rangée porte les noms des quatre niveaux, des points par niveau, un total sur 50) ; la grille d'une collègue (des réponses en lignes avec leurs points, sans niveaux nommés, des critères sans nom, une phrase coupée en deux rangées par la mise en page).

## Ce que Grégoire a tranché ce matin

- **Les étiquettes et leurs descriptions** : celles de l'ébauche (tableau `TYPES` du prototype). Le noyau : Critère « Ce que tu évalues » / « Ce qui est attendu : la question que tu te poses devant la copie » ; Élément observable (le sous-critère) « Un sous-critère » / « Ce que tu regardes dans toutes les copies pour juger du critère » ; Descripteur « Ce que tu vois dans une copie, à un niveau donné » / « Une réponse possible à la question du critère (une seule vaut pour une copie) » ; Points « Les points d'une réponse » / « Ce qu'elle vaut, en chiffres » ; Niveau « Le nom d'un niveau de réussite » / « Un stade de qualité du travail observé », **facultatif**. Les autres textes de l'ébauche sont provisoires : ils passent à l'étape 3.
- **Deux logiques de notation** (6 h 43) : des points qui s'additionnent jusqu'à un total (la pratique sommative traditionnelle), ou des niveaux jugés critère par critère (la pratique alternative). L'application dit laquelle elle lit, et **ne convertit jamais l'une en l'autre sans l'enseignant**.
- **Pour le lot 2, le résultat d'une copie** (7 h 31) : quand la grille a des points, il vient **des points, par défaut** ; l'enseignant peut choisir les niveaux, et seulement alors l'application lui demande une valeur par niveau. Ses noms de niveaux restent comme titres des descripteurs. Ce que devient ce résultat dans la note du cours (moyenne en sommative, meilleurs résultats sur au moins quatre productions dans sa pratique alternative) relève de la pratique de notation, choisie ailleurs ; la note lettrée transmise à l'étudiant·e est une présentation du total : ni l'une ni l'autre ne touche ce lot.
- L'étiquetage est fait par l'enseignant ; une propagation (« étiquette une rangée, l'application propose les autres ») est une suite, pas ce lot.

## Les étapes, dans l'ordre

1. **Étiqueter sa grille dans l'onglet** : coller, voir, surligner, lire. Rien n'est créé. *(`CONSIGNE-LOT-2026-10-18-dissection-1-etiqueter.md`)*
2. **Créer sa grille depuis la lecture** : la lecture devient le modèle de `materielAssistant.construire` (mesuré : une fonction pure, indépendante des questions), et `materiel-creation.js` écrit les objets ; la confirmation existante s'affiche. D'abord les grilles en points (le cas le plus courant, selon Grégoire), puis les grilles en niveaux.
3. **Les mots d'écran**, sur une seule page, et l'entrée des Nouvelles.
4. **La version, la vérification de nuit, le push** ; une nouvelle porte terrain lundi matin, avant 11 h (celle d'hier visait l'assistant en sept étapes : périmée).

**Repli** : vers 17 h, ce qui est fini et relu part ; le reste se présente lundi comme la suite annoncée.

## Après lundi (inscrit, pas oublié)

- Retirer le code des sept étapes, débranché aujourd'hui sans être supprimé (pas de grand ménage la veille de la rencontre).
- La propagation des étiquettes ; le rangement de plusieurs grilles disséquées ; la fusion du chantier CI (lundi après-midi, déjà prévue).

## Avancement

- [ ] 1
- [ ] 2
- [ ] 3
- [ ] 4
