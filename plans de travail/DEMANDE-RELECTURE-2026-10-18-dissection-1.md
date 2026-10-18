# Demande de relecture – la dissection, lot 1 : étiqueter sa grille dans l'onglet

> Claude Code, dimanche 18 octobre 2026, vers 7 h 50 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-18-dissection-1-etiqueter.md` (7 h 17). Pour Cowork (`PROTOCOLE.md`, règle 2).
> Deux commits locaux sur `main`, **non poussés** : `9756388a` (les documents de la consigne, comme demandé), puis le commit du lot, qui porte aussi cette demande. **Pas de version, pas de verdict, pas de push.**

## État mesuré

- **Vitest complet** (depuis `tests/`) : **772 fichiers, 9 151 essais, verts**. Avant le lot : 771 et 9 132. Le banc neuf compte 15 essais. La sentinelle de complexité est verte : aucune fonction neuve au-dessus de 15.
- **WebKit, specs touchées seulement** (ce n'est pas le verdict) : `materiel-dissection-1` (3), `materiel-bandeau-construction`, `materiel-lot1-onglet` (2) et `icones-i-catalogue-c3`, soit **7 verts**. Les **17 essais** des six specs de l'assistant sont suspendus (voir « Débranché »).
- **Break-tests** (tous restaurés, arbre vérifié par `diff`) :
  - `innerHTML` à la place de `textContent` dans la feuille : rouge en Vitest S.b et en WebKit (le collage piégé) ;
  - la coupure des critères sans nom désactivée : rouge en B ;
  - la « Suite » ignorée : rouge en B ;
  - le `pointermove` débranché (le glisser) : le compte attendu était 3, il est resté à 1 ;
  - `touch-action: none` retiré : rouge.
- **Rien n'est écrit** : `grep db.|localStorage|sessionStorage|indexedDB` ne trouve rien dans les deux modules neufs.

## Ce que j'ai réutilisé, ce que j'ai écrit à neuf

**Réutilisé** : `materielLecture.lirePressePapiers`, qui passe par `lireHtml` (un `DOMParser` inerte) puis `lireTexte` (les tabulations). Il donne, pour chaque case, ses lignes séparées par `\n` et ses fusions `span`/`rspan` ; les rangées vides sont gardées. **`deplier` n'est pas retenu** : il remplit les cases fusionnées et perd la case d'origine, alors que la dissection a besoin de la case telle quelle. La place (rangée, colonne) se calcule directement sur les rangées lues, comme `calculerPositions` dans l'ébauche.

**Écrit à neuf** :

| Fichier | Contenu |
|---|---|
| `js/materiel-dissection-lecture.js` (pur) | Repli pour le texte brut d'un PDF (des lignes dans l'ordre) et pour un HTML sans tableau (porté de `lignesDeCellule`). `morceaux`, `comprendre` (porté, même comportement, découpé en lecteurs par étiquette pour la sentinelle de complexité), `bilan` (somme, total, logique lue), `exempleDoc` (grille fictive). |
| `js/materiel-dissection.js` | L'interface. |
| `styles.css` | Le bloc « la dissection ». |
| `index.html` | Le squelette `#materiel-dissection` et les deux scripts. |
| `tests/unit/_helpers/grilles-fictives-dissection.js` | Les grilles fictives (a), (b) et (c), partagées par Vitest et WebKit. |

**Écarts avec l'ébauche, voulus** :

1. Seul le **premier** tableau est lu (`lireHtml`), là où l'ébauche prenait le plus grand. Le texte d'un second tableau n'est pas perdu : il arrive comme texte après le tableau.
2. Le texte **avant et après** le tableau reste à l'écran, sur une rangée de toute la largeur, et peut recevoir une étiquette. L'ébauche le jetait ; la règle du projet est que rien ne disparaît en silence.
3. Les flèches sont dessinées dans un SVG en position absolue dans l'atelier, au lieu d'une couche `fixed` sur toute la fenêtre. Motif : une couche `fixed` serait fragile sous les conteneurs de l'application.
4. Retirés, conformément à « rien n'est écrit » : la sauvegarde locale, « Mes grilles enregistrées » et l'exemple déjà étiqueté (la grille Cornell).
5. Les douze couleurs de surligneur sont des variables **neuves**, limitées à `.dissection`, en sombre et en clair (`.mode-clair`). Elles reprennent les valeurs de l'ébauche, avec le motif écrit en tête du bloc CSS.

## Débranché, pas supprimé

`materiel.js` : un collage, le bouton « Reconnaître le texte ci-dessus » et « Essayer avec un exemple » ouvrent désormais la dissection. L'assistant (`charger`, `ouvrirAssistant`, les étapes, `creer`) reste dans le code, sans aucun geste qui y mène. **« Taper ma grille à la main » mène vers Grilles de critères** : le bouton est gardé, puisque les outils de Conception restent la façon de créer.

Specs :

- **Six specs suspendues** par `test.skip(() => true, …)`, avec la même mention : `lot2-assistant`, `lot3a-roles`, `lot3b1-visible`, `etape5-points`, `etape5b-reconnaissance` et `etape6-plus-loin`, soit 17 essais. Elles parcouraient l'assistant ; elles partiront avec lui.
- **`icones-i-catalogue-c3`** passait par l'assistant pour créer F6 : elle passe maintenant par les mêmes fonctions qu'il appelait, puis par `ouvrirGrilleDepuisListe`. Elle est à re-router par la dissection au lot 2.
- **`materiel-bandeau-construction`** et **`materiel-lot1-onglet`** (essai 1) sont adaptées à la dissection.

## Les textes d'écran (inventaire pour l'étape 3)

Tous sont provisoires.

**De l'ébauche, repris tels quels** : les trois consignes ; les textes de la palette (le noyau, tranché par Grégoire) ; les bandeaux et messages d'état ; « Ta grille, telle que l'application la comprendrait » et sa phrase d'explication ; les trois phrases de logique ; les constats ; les messages « vide » ; « Ces morceaux ont une étiquette, mais… » ; les raisons « sans place » ; « Retirer les étiquettes » et « Confirmer : tout retirer » ; « Terminer ».

**De Claude Code** :

- le titre « Étiquette ta grille » (l'ébauche disait « Dissection d'une grille », le nom de travail) ;
- « Coller une autre grille », déplacé dans l'onglet ;
- le message « Rien de lisible dans ce que tu as collé. Copie le tableau de ta grille dans Word ou Pages, ou le texte d'un PDF, puis colle-le ici. » ;
- les textes de l'exemple fictif, « Journal de lecture ».

⚠ **Textes de l'accueil validés par Grégoire (étape 7) que j'ai modifiés**, parce que le parcours qu'ils décrivaient n'existe plus :

- l'introduction (« Elle te pose ensuite quelques questions » est devenu « c'est toi qui montres à l'application ce que chaque morceau veut dire ») ;
- l'étape 2 (« reconnaît les critères » est devenu « s'affiche telle quelle ») ;
- l'étape 3 (« Réponds, vérifie, crée » est devenu « Étiquette, puis lis »).

**Gardés tels quels, bien qu'un peu inexacts maintenant**, pour ne pas toucher davantage à des textes validés : l'étape 1 (« Copié depuis un PDF, il arriverait sans ses cases, en texte désordonné », alors que le texte d'un PDF est maintenant accepté), le texte indicatif de la zone de collage, et le bouton « Reconnaître le texte ci-dessus ». À trancher à l'étape 3.

## Ce que j'ai supposé

- Au-dessous de 1 024 px, la palette passe **au-dessus** du canevas. L'ébauche faisait ce changement à 860 px ; dans l'application, la largeur utile est plus petite. Conséquence mesurée sur capture à 820 px : la palette occupe environ 900 px de hauteur avant le canevas, et les flèches traversent le bandeau. **À voir sur l'iPad réel** : c'est la question « où regarder » que Grégoire a soulevée ce matin.
- La dissection en cours est perdue avec « Coller une autre grille », sans confirmation, puisque rien n'est écrit.
- L'exemple fictif est une grille à sections et niveaux, de la forme (a), et s'ouvre sans étiquette.

## Trouvailles

1. **Une « Suite » posée après des Points dans la même rangée tombe « sans place »** (raison : « aucun morceau à compléter avant elle »). C'est le comportement de l'ébauche, porté tel quel. Les Points remettent la suite à zéro. Le banc (b) place donc les points de la phrase coupée sur la seconde rangée. *Inscrit ici*, pas au BACKLOG, faute de symptôme vécu. À trancher par toi ou par Grégoire au lot 2.
2. Hors lot, relevé par l'audit de début de session :
   - la date de fusion du chantier CI : lundi après-midi selon le plan et RELAIS, mardi 20 selon une mémoire de Claude Code ;
   - un worktree d'essai abandonné, `.claude/worktrees/verdict-morceaux`, sur une branche locale sans origine. *Inscrire et continuer* ; je n'y ai pas touché.

## À regarder en priorité

1. Les six specs suspendues : est-ce le bon geste la veille d'un verdict, ou préfères-tu un autre filet pour le code débranché ?
2. Les trois textes validés que j'ai modifiés, et les trois que j'ai gardés.
3. La palette au-dessus du canevas sur l'iPad.
