# Cadrage – « Apporter mon matériel », première version pour la rencontre CoP du 19 octobre 2026

> Écrit par Cowork le 15 octobre 2026 à 16 h 21 (Toronto, mesuré par `date`), sur les décisions de Grégoire de 16 h 13 à 16 h 19. Source de la réflexion : la page « Interface – l'obstacle d'entrée » et son ébauche de plan (dossier Cowork de la CoP, hors dépôt).
> ⛔ Aucun nom d'élève ni de collègue dans ce que tu écris au dépôt.

## Pourquoi

Les personnes débutantes trouveraient l'application intimidante (retours rapportés, pas encore observés). Leur grille d'évaluation existe déjà, le plus souvent dans Word : un seul tableau, critères en lignes, niveaux en colonnes, un descripteur dans chaque case. L'application leur demande aujourd'hui de la découper en trois objets aux noms qu'elles ne connaissent pas (grille, échelle, cartouche). Le nouvel espace reçoit leur tableau tel quel et fait le découpage lui-même.

## Les décisions de Grégoire (15 oct. 2026)

1. **Un sous-onglet de Conception nommé « Apporter mon matériel », en PREMIÈRE position** (16 h 15–16 h 17). Mesuré : la navigation affiche la première sous-section de la configuration à l'ouverture d'un onglet (`js/navigation.js` ~441-444) ; c'est donc lui qui s'affichera quand on ouvre Conception. ⚠ `js/config.js` est en zone protégée : **l'autorisation de Grégoire pour ce changement est donnée par cette décision** ; la consigner dans le commentaire de `configurationsOnglets.conception`, comme les autorisations du 8 août.
2. **Le descripteur d'une case vit dans la GRILLE, pas dans la cartouche** (16 h 19). Motif didactique : un descripteur dit à quoi ressemble un niveau, avant la tâche ; un commentaire de cartouche parle à l'étudiant·e, après. Ajout seulement : aucune grille existante ne change.
3. **Version sobre** : aucune lecture de fichier. La personne saisit ou colle un tableau ; le presse-papiers seulement.
4. **Priorité sur la purge de l'historique (#781)**, reportée après le 19 oct. (16 h 19). Le dépôt est privé (vérifié le 7 sept. ; Grégoire projette de le rouvrir au public, ce qui confirme qu'il ne l'est pas) : le report ne crée pas d'exposition. Les commits de ces trois jours n'ajoutent aucune donnée personnelle ; la purge s'appliquera à un historique plus long, sans autre effet.
5. **Échéance : une première version en ligne le lundi 19 oct. au matin.**
6. **Descripteur ou rétroaction : la personne le dit** (16 oct., 12 h 34). Le critère de distinction est le moment : le descripteur dit à quoi ressemble un niveau, AVANT la tâche ; la rétroaction s'adresse à l'étudiant·e, APRÈS l'évaluation. Un tableau Word peut contenir l'un ou l'autre (même forme : un texte par critère et par niveau). Au-dessus du tableau, une question : « Les cases de ton tableau : décrivent les niveaux / s'adressent à l'étudiant·e ». Selon la réponse, les textes vont dans la grille (descripteurs) ou dans une cartouche liée à la grille et à son échelle (`commentaires["<critère>_<niveau>"]`). L'application peut présélectionner d'après le texte (tutoiement), mais affiche le choix comme « proposé : à vérifier ». Voir le prototype « Apporter mon matériel » (artefact de Cowork).


## Ce que la personne verra lundi

1. Elle ouvre Conception : « Apporter mon matériel » s'affiche, avec une courte phrase d'accueil.
2. Elle copie sa grille dans Word ou Pages et la colle dans le tableau à l'écran ; ou elle la tape.
3. Elle vérifie les titres des niveaux, leur valeur, la pondération des critères ; elle nomme sa grille.
4. « Créer » : sa grille (critères et descripteurs) et son échelle (niveaux) existent, elle peut évaluer une copie avec elles.
5. En évaluant, le niveau choisi pour un critère montre son descripteur.

## Suppositions de Cowork, à tenir (dites à Grégoire en une ligne)

- **Plages de notes des niveaux : saisies par la personne, aucune proposée** (demande de Grégoire, 16 oct., 12 h 45 : « de telle note à telle note, c'est tel niveau »). Une plage proposée serait une norme du projet. Champs « De » et « À » requis, vides au départ ; lus dans l'en-tête quand le document les donne (« Excellent (85-100 %) »). **Pas de note ponctuelle** (Grégoire, 16 oct., 12 h 55 : l'outil conçoit les concepts de la grille, il ne règle pas l'évaluation) : l'assistant ne demande ni n'écrit `valeurCalcul`. Mesuré : à l'évaluation, un niveau sans `valeurCalcul` prend déjà le milieu de sa plage (`js/evaluation-calcul.js` ~1520). Qui veut une note fixe la pose plus tard dans Échelles de performance. Plages contiguës comme dans l'échelle de départ IDME (`js/echelles.js`, 0-64,99 / 65-74,99…) : des plages saisies en entiers (65-74, 75-84) s'enregistrent avec `max` = `min` du niveau suivant − 0,01, pour qu'une note de 74,5 tombe dans un niveau (supposition de Cowork, technique). Chevauchement ou trou entre plages : avertissement au conditionnel, non bloquant.
- **Pondération des critères : requise ; si la personne la laisse vide, parts égales, AFFICHÉES avant la création** (rien de silencieux).
- **Les descripteurs sont liés aux niveaux de l'échelle créée avec eux.** Une grille évaluée avec une autre échelle n'affiche pas ses descripteurs : aucune correspondance devinée entre niveaux.
- **Un chemin de plus, sans retrait (entorse nommée à « zéro-dette »).** Le tableau s'ajoute aux écrans existants. La question « un ou deux chemins » (le tableau devient-il LA façon de créer une grille ?) revient à Grégoire après le 19 oct.
- **Le sens du tableau se choisit** (idée de Grégoire, 15 oct., 16 h 30) : certaines grilles Word ont les niveaux en lignes et les critères en colonnes. Après un collage, un bouton « Inverser lignes et colonnes » permet à la personne de dire quel axe porte les critères ; l'application ne devine pas en silence. Lot 2.
- **On colle un tableau, on n'ouvre pas un fichier.** Ce qui se reconnaît : un tableau copié dans Word, Pages ou un tableur (presse-papiers en HTML), ou du texte en colonnes séparées par des tabulations. Un texte en prose, sans tableau, ne se reconstruit pas : le dire à l'écran plutôt qu'échouer en silence.
- ~~Pas de cartouche créée en v1~~ (remplacé par la décision 6, 16 oct.) : la branche « rétroactions » crée une cartouche ; ordre des lots : elle passe au lot 3, avant l'affichage du descripteur à l'évaluation, qui glisse après le 19 si le temps manque. Ancienne note : la cartouche de départ reste. Les commentaires collés vers une cartouche existent déjà (`#commentairesColles`) : l'espace y renvoie.

## Deux règles tirées d'un essai d'exam.net (16 oct. 2026)

Grégoire a fait convertir par exam.net (« Convertir PDF », bêta) un questionnaire de dix questions, dont cinq en bonus à 0,5 point. Constaté sur ses captures : la consigne est bien devenue un bloc d'information ; mais chaque question a reçu 1 point inventé, un type « simple réponse » contraire à la consigne (« phrases complètes »), et la ligne « Bonus (0,5 pt par bonne réponse) » a **disparu sans trace** (total affiché : 10 points). Rien à l'écran ne distinguait ce qui venait du document de ce qui avait été deviné. Côté Word, la page « Comment ça marche » d'exam.net ne propose que le collage (« coller des questions à partir de Microsoft Word ») : même choix que la version sobre retenue ici.

Pour « Apporter mon matériel », applicables au collage dès le lot 2 :

1. **Rien ne disparaît en silence.** Ce que l'application ne sait pas placer (une ligne hors tableau, une cellule fusionnée, une note sous la grille) va dans une zone « À classer », visible avant la création ; la personne le range ou l'écarte elle-même.
2. **Ce qui a été complété se voit.** Ce qui vient tel quel du tableau collé et ce que l'application a dû compléter (pondération en parts égales, codes de niveau) se distinguent visuellement, pour que la personne sache où regarder.

## À dire à l'utilisateur (noté le 16 oct., 12 h 58, à rédiger plus tard)

- **Les plages se touchent.** Des plages saisies en entiers (65-74, 75-84) sont enregistrées contiguës (74,99), comme l'échelle de départ, pour qu'une note comme 74,5 tombe dans un niveau. L'écran devra le dire simplement, au moment opportun (texte à proposer à Grégoire).

## Ce que l'assistant fait aussi (Grégoire, 16 oct., 12 h 58)

L'assistant enseigne : il apprend à la personne à se servir de l'application et à comprendre grilles, échelles et, plus tard, cartouches. Ce qu'il produit se retrouve ensuite dans la barre latérale de chaque outil (Grilles de critères, Échelles de performance, Cartouches de rétroaction), pour y être peaufiné.

## Les lots

| Quand | Lot | Ce que Grégoire verra |
|---|---|---|
| Ven. 16 | 1. Le modèle, l'onglet, la lecture d'une grille collée, l'aperçu | Conception s'ouvre sur le nouvel onglet ; une grille collée (ou l'exemple) s'affiche telle que l'application l'a reconnue |
| Sam. 17 | 2. L'assistant et la création (grille, échelle, cartouche si rétroactions) | Il répond aux questions, vérifie, crée ; la grille et l'échelle existent |
| Sam. 17 soir | Release et verdict du soir (lots 1-2) | Il essaie avec ses vraies grilles dimanche, Mac et iPad (porte terrain : Word et Pages) |
| Dim. 18 | 3. Les mots relus, les liens vers la barre latérale de chaque outil, les Nouvelles | Une seule page de textes à relire ; « La voir dans… » ouvre l'outil, l'objet créé sélectionné |
| Dim. 18 soir | Release et verdict du soir | En ligne lundi matin |

Révisé le 16 oct. à 14 h 15, d'après le prototype validé par Grégoire (`PROTOTYPE-2026-10-16-apporter-mon-materiel.dc.html`). Repli si le temps manque : lots 1 et 2 suffisent à la démonstration. Après le 19 : le descripteur affiché là où on évalue, l'aller-retour (rouvrir une grille dans le tableau), un ou deux chemins.

**Lundi, les membres de la CoP essaieront leur propre matériel en direct** (intention de Grégoire, 15 oct., 16 h 32). Conséquence : la robustesse du collage devant des grilles variées (cellules fusionnées, niveaux en lignes, pondérations dans les en-têtes, cases vides) passe avant le lot 3. Un tableau que l'application ne sait pas lire doit produire un message clair et laisser la saisie à la main possible, jamais une erreur muette. La v1 crée une grille et son échelle, pas de cartouche : à dire aux membres.

## Ce qui reste hors de cette version

L'accueil qui montre une rétroaction de la démo, le lexique du premier contact, évaluer sans horaire, la copie annotée dans la démo, le choix d'un ou deux chemins : dans l'ébauche de plan de Cowork, après le 19 oct.
