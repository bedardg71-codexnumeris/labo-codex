# Textes – le barème d’un critère analytique, validés par Grégoire

> Réponses de Grégoire du mardi 20 octobre 2026, 9 h 23, sur la page « Les textes du barème » (35 sur 35, toutes « me va » ou « ta proposition me va ») ; consignés par Cowork à 9 h 24. **À recopier tels quels**, apostrophes typographiques (’) partout, comme le reste des catalogues. Les marques ‹…› désignent une valeur insérée et n’en font pas partie.

## Le lexique (`accompagnement-contenu-terme.js`) – source unique des définitions

- **A1** (terme neuf « Barème » (`bareme`)) : Pour un critère noté en points, ce que valent ces points : une suite de tranches, chacune avec ses points et ce qu’on attend d’une copie qui les obtient. Chaque critère analytique a son propre barème.
- **A2** (terme neuf « Tranche » (`tranche`)) : Une partie d’un barème : des points (un nombre, comme 2, ou deux bornes, comme 3 à 4), ce qu’on attend d’une copie qui les obtient et, si tu veux, un nom, comme « Partiel ».
- **A3** (« Échelle de performance » (remplace la définition actuelle)) : Les niveaux que tu attribues aux critères holistiques lors de l’évaluation ; une seule échelle par évaluation. Par défaut, quatre niveaux alignés sur IDME : Incomplet, Développement, Maîtrise, Étendu. Tu configures les seuils, les valeurs ponctuelles et les couleurs selon ton jugement professionnel.
- **A4** (« Type de critère » (remplace la définition actuelle)) : La méthode d’évaluation d’un critère dans une grille. Trois types sont disponibles : holistique (tu attribues un niveau de l’échelle de performance), analytique (tu attribues des points, que son barème décrit) et algorithmique (calcul automatique selon une formule, ex. : nombre d’erreurs / nombre de mots × 100 pour le français écrit).

## L’aide « i » du barème (`accompagnement-contenu-popup.js`, entrée neuve), ouverte à côté du titre « Barème » de chaque critère analytique

- **B1** (titre) : Le barème d’un critère
- **B2** (texte) : Un critère analytique se note en points, de 0 à sa pondération. Son barème dit ce que valent ces points : chaque tranche porte ses points et ce qu’on attend d’une copie qui les obtient, avec un nom si tu veux. Deux tranches ne se chevauchent pas : des points donnés tombent dans une seule.
- **B3** (texte) : Avec une échelle, tu choisis un niveau et l’échelle donne la note. Avec un barème, tu donnes des points et le barème dit à quoi ils correspondent. C’est pourquoi une évaluation n’a qu’une échelle, alors que chaque critère analytique a son propre barème.
- **B4** (exemple : la première ligne est son titre, les trois suivantes son contenu) :
  « L’étudiant·e résume l’œuvre avec justesse », sur 5 points.
  Partiel, 2 points : Résume quelques événements.
  Satisfaisant, 3 à 4 points : Résume l’essentiel.
  Remarquable, 5 points : Résume avec précision et concision.
- **B5** (conseil) : Le barème ne change aucune note : la note vient des points que tu donnes, avec ou sans barème. Il peut t’aider à donner les mêmes points à deux copies semblables.
- **B6** (voir aussi : `construction-echelles`, `echelle-plage-notes`, `grille-type-critere-detail`) : Configurer les échelles de performance · Plage de notes (niveau) · Type de critère d’évaluation

## Les trois types de critère

- **C1** (l’aide « i » `grille-type-critere-detail` : ses trois lignes remplacent les actuelles ; le nom du type reste en gras, suivi du deux-points) :
  Holistique : tu attribues un niveau de l’échelle de performance ; l’échelle donne la note du critère.
  Analytique : tu attribues des points, de 0 à la pondération du critère ; son barème dit ce qu’ils valent.
  Algorithmique : un calcul automatique, à partir d’une formule (ex. : nombre d’erreurs en français écrit).
- **C2** (la bulle `cn-grille-type-critere` (remplace le texte actuel)) : Méthode d’évaluation du critère : holistique (tu attribues un niveau de l’échelle), analytique (tu attribues des points, que son barème décrit) ou algorithmique (calcul automatique, ex. : français écrit).

## Les mots de l’éditeur (déjà dans le code depuis `e0357f74` ; validés tels quels)

- **D1** (libellés) : Barème · Nom · Points · Texte · + Ajouter une tranche · Retirer cette tranche (titre de la corbeille)
- **D2** (les deux marques) :
  à compléter (une tranche qui n’a pas encore ses points)
  hors barème (des points qui dépassent la pondération du critère)
- **D3** (confirmation du retrait) : Es-tu sûr de vouloir retirer cette tranche ?
- **D4** (refus) : Au plus 20 tranches par critère
- **D5** (refus) : Une tranche fait 5 000 caractères au plus
- **D6** (refus) : Ces points ne se lisent pas : écris un nombre (3 ou 2,5) ou deux bornes (3 à 4)
- **D7** (refus) : Les points d’une tranche commencent à 0 : corrige-les
- **D8** (refus) : Les points d’une tranche vont de 0 à ‹N›, la pondération du critère : corrige-les, ou change la pondération
- **D9** (refus) : Ces points chevauchent ceux de la tranche « ‹Nom› » (‹3 à 4›) : choisis des points qu’aucune autre tranche ne couvre
- **D10** (refus) : Le nom d’une tranche fait 200 caractères au plus

## Les bulles de l’éditeur (`accompagnement-contenu-hover.js`, entrées neuves)

- **E1** (le champ « Nom ») : Facultatif : un mot pour reconnaître la tranche, comme « Partiel ».
- **E2** (le champ « Points ») : Un nombre (3 ou 2,5) ou deux bornes (3 à 4), de 0 à la pondération du critère. Deux tranches ne se chevauchent pas.
- **E3** (le champ « Texte ») : Ce qu’on attend d’une copie qui obtient ces points.
- **E4** (« + Ajouter une tranche » (suppose la correction C1 du verdict du lot 1)) : Ajoute une tranche au bas du barème. Elle s’enregistre aussitôt et reste « à compléter » jusqu’à ce que tu lui donnes ses points.
- **E5** (la marque « à compléter ») : Cette tranche n’a pas encore de points : donne-les-lui pour qu’elle compte dans le barème.
- **E6** (la marque « hors barème ») : Ces points dépassent la pondération du critère, qui a baissé depuis : corrige les points de la tranche, ou la pondération.

## La section de l’onglet Aide, sous « Configuration » (`index.html`, à côté de « Apporter une grille que tu as déjà »)

- **F1** (titre) : Le barème d’un critère analytique
- **F2** (à quoi sert le barème) : Un critère analytique se note en points, de 0 à sa pondération. Son barème dit ce que valent ces points. Il se compose de tranches : chacune porte ses points (un nombre, ou deux bornes comme « 3 à 4 »), ce qu’on attend d’une copie qui les obtient et, si tu veux, un nom. Tu l’écris dans Conception › Grilles de critères, sous le critère.
- **F3** (un tableau à deux colonnes, « Échelle de performance » et « Barème » ; chaque ligne : son intitulé, puis la case de l’échelle | la case du barème) :
  À quels critères : les critères holistiques | les critères analytiques
  Ce que tu choisis : un niveau | des points
  Ce que l’outil donne : la note du critère | ce à quoi les points correspondent
  D’un critère à l’autre : une seule échelle pour toute l’évaluation | chaque critère a le sien
- **F4** (ce que le barème ne fait pas) : Le barème n’entre dans aucun calcul : la note, les indices et le dépistage lisent les points que tu donnes, avec ou sans barème.
- **F5** (tes grilles d’avant) : Une grille créée par « Apporter mon matériel » avant le barème montre les réponses de ses critères comme un barème. Rien ne change dans tes données tant que tu ne touches pas au critère ; ta première modification l’enregistre tel qu’il est affiché, sans rien perdre.

## Ailleurs

- **G1** (la primo-aide, la première fois qu’un barème paraît dans Grilles de critères, suivie d’un lien vers l’aide « i » du barème) : Ce critère se note en points : son barème dit ce qu’ils valent, tranche par tranche.
- **G2** (« Apporter mon matériel », « Aller plus loin avec ta grille » d’une grille en points (`PLUS_LOIN.enPoints`, `materiel.js`) : **avec le lot où la dissection écrira des tranches**, pas avant) : Ta grille note chaque critère en points, et chaque critère porte son barème : ce que valent ses points. Tu le retrouves sous le critère, dans Grilles de critères.

