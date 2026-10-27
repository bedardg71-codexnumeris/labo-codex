# Demande de relecture – Les calculs, lot 4b : « Retoucher ce calcul » et « Composer ton propre calcul », pour la note

> Claude Code, mardi 27 octobre 2026, sur `main`. Commits : `c7a2e7fc` (retouches du verdict de la note remise), `15c10b7e` (docs du § 0), `174806a8` (le lot), puis celui-ci. Rien de poussé. Consigne : `CONSIGNE-LOT-2026-10-27-critere-algorithmique-calculs-4b.md`. Vitest 9 883 / 9 883 ; Playwright WebKit : la spec du lot (11 essais et les captures), celle de 4a, et 78 specs voisines (147 tests : 139 réussis, 8 sautés, 0 échec). Le verdict complet de la suite n'est pas pris (au signal de Grégoire, avec le push).

## 1. Ce qui a été fait

- **Le registre** (`js/evaluation-formules.js`) reste la seule source.
  - Un calcul composé se lit dans `critere.calculs` (`[{ id, nom, sert: 'note', jetons, cas }]`). `modeleFormule = 'perso:<id>'` le choisit pour la note.
  - Il s'évalue par l'évaluateur de 4a. La note s'arrête à la pondération par le haut, sans être relevée à 0, et le pourcentage est borné.
  - **Introuvable ou illisible**, le calcul ne donne aucune note : `applicable: false`, `raison: 'calcul-introuvable'`, aucune ligne chiffrée, aucune pastille. `herite` reste faux, et il n'y a jamais de repli vers `penalite_normalisee`.
  - Fonctions nouvelles :
    - pour lire et transporter : `assainirCalculs`, `refusCalculs` ;
    - pour garder, retirer et choisir : `garderCalcul`, `retirerCalcul`, `choisirCalculCompose` ;
    - pour le brouillon : `brouillonRetouche`, `brouillonDuCalcul`, `refusDuBrouillon`, `ligneDuBrouillon`, `casDuBrouillon`, `blocsDesJetons`.
  - Les messages sont ceux de l'ébauche (`ERREURS_CALCUL`) et de la consigne.
- **« Vaut 0 » d'un calcul composé** : il porte ses choix dans son propre `cas`.
  - Départs : « Aucune note » pour une donnée qui divise, « Calculer normalement » sinon.
  - Un choix égal au départ retire l'entrée. Jamais « calculer » une division.
- **Le compte brut est branché.** Les appelants passent `compte` à côté du compte pondéré :
  - l'évaluation, en mode simple et en mode catégories (le calcul et sa ligne chiffrée) ;
  - la copie fictive de l'atelier ;
  - la simulation (`miroirAlgo.essayer`) ;
  - les tables de cas ;
  - l'estimation du critère effondré (`evaluation-retroaction.js`).

  Les trois tout faits n'en lisent toujours rien (vérifié par test).
- **Le gabarit** (`js/grilles.js`, l'étape « Note calculée », découpée en fonctions) :
  - les calculs composés prennent leur carte après les trois (« Ton calcul. ») ;
  - la carte choisie montre ses pastilles, sa ligne sur la copie fictive, ses choix « vaut 0 », « Modifier ce calcul » et « Retirer ce calcul » ;
  - la carte d'un calcul tout fait choisi porte « Retoucher ce calcul » ;
  - un message en tête de l'étape dit « Calcul « X » gardé : il donne maintenant la note. », ou le refus du retrait ;
  - un calcul de la note introuvable : aucune carte choisie, et « Le calcul qui donnait la note est introuvable dans cette grille : choisis un calcul. »
- **Le composeur** (`js/composeur-calcul.js`, module neuf) :
  - le brouillon vit en mémoire, par critère (la clé de l'atelier). Poser un bloc, taper le nom ou un nombre ne redessinent que le composeur : le focus et le défilement restent, et un redessin complet du gabarit garde le brouillon et l'ouverture ;
  - « Poser ce nombre » accepte la virgule, et Entrée dans le champ pose le nombre ;
  - « Garder » passe par `grilles.js` (`garderCalculAlgo`, la file `_modifierCritereCible`) : rien n'est écrit avant.
- **Les gestes** (`js/grilles.js`) : `garderCalculAlgo`, `retirerCalculAlgo`, `confirmerRetraitCalculAlgo`, `annulerRetraitCalculAlgo`, branchés par le dispatcher générique de `main.js` (`data-action`). `choisirCalculNoteAlgo` choisit aussi un calcul composé. Revenir d'un calcul composé à un tout fait retrouve le réglage écrit : `paramsFormule` est resté intact.
- **La chaîne d'étapes** : l'info dit « « X » » et le résumé « « X », sur 20 ». Un calcul introuvable laisse l'étape « à régler ».
- **Le transport** :
  - import : le type dédié `calculs`, relu par le registre, avec les noms passés par `assainirChaine` ;
  - partage : un schéma fermé (le type `chaine-ou-nombre`, pour la valeur d'un jeton), puis `refusCalculs` au niveau 3 ;
  - export, codex, copie de grille et bibliothèque copient le critère entier (`grep` : `{ ...c }`).
- **Le style** (`styles.css`) : le composeur et le message, ramenés aux variables de `design-system.html`. Le message n'a pas de liseré (bordures égales). Les cibles font au moins 44 px, y compris tous les menus « vaut 0 » (40 px depuis 4a).

## 2. Ce que la mesure a dit (et que la consigne ne savait pas)

1. **Un identifiant qui ne se réemploie pas demande un compteur.** Sans lui, retirer `calc2` puis garder un calcul rendait `calc2`. J'ai ajouté `critere.calculsProchain` (le numéro du prochain). Il voyage à l'import et au partage, et il survit au retrait.
2. **« Retirer » sur une carte non choisie.** Dans l'ébauche, les gestes ne paraissent que sur la carte choisie. Or celle-ci est le calcul de la note, dont le retrait est refusé (§ 3.6) : « Retirer » n'aurait jamais abouti. La carte non choisie d'un calcul composé garde donc « Retirer ce calcul ». La confirmation se fait en place, comme pour les tables de cas, et non par une fenêtre du système.
3. **La garde des jetons double celle de l'évaluation.** Un réglage `p` dans un calcul composé est déjà refusé par l'essai sur la copie fictive : sans réglage, il vaut `NaN`. Le break-test de cette garde laisse le banc vert ; je l'ai remplacé par un break-test qui mord (la borne du nom).
4. **Les copies de référence de la simulation** (« Beaucoup », par dichotomie) supposent une note qui ne monte pas avec le compte. C'est vrai des trois tout faits, pas forcément d'un calcul composé : un calcul qui monte avec le compte donnerait une copie « Beaucoup » sans cohérence. Ce n'est mesuré sur aucun calcul. Issue : **inscrire** si Cowork juge que c'est un symptôme ; sinon, commenter.
5. **`comptes-erreurs-stock.js`** (la réparation de #1142) ne passe pas `compte`. Le compte brut y vaut le compte pondéré. Un calcul composé qui lit les deux recalculerait donc autrement le stock qu'il répare, mais la réparation ne vise que l'automne 2026 et des grilles d'avant 4b. Issue : **commenter et oublier**.

## 3. Les suppositions que j'ai faites seul (à corriger d'un mot)

1. **Des textes sont de moi**, faute de texte validé :
   - « Ce critère a déjà 10 calculs : retires-en un d'abord. » ;
   - « Le calcul compte plus de 60 blocs. » (le composeur cesse aussi de poser au 61e) ;
   - « Calcul introuvable » / « calcul introuvable » (le nom, et l'info de la chaîne) ;
   - « Retirer » et « Annuler » de la confirmation, ceux des tables de cas.
2. **`sert` n'admet que `'note'`.** Un calcul `'phrases'` (lot 4c) arrivé dans cette version est écarté à l'import et refusé au partage. « Garder » ne réécrit que l'entrée gardée : une entrée que cette version ne lit pas n'est pas effacée en passant.
3. **La copie d'essai de « Garder »** met chaque donnée, pondération comprise, à 1. Une division par une donnée (et non par le nombre 0) est permise : « vaut 0 » dit alors ce que vaut la note.
4. **Le nom** a ses espaces retirés aux deux bouts, et 80 caractères au plus (le champ s'arrête là).
5. **« Annuler »** jette le brouillon et replie le composeur, sans confirmation.

## 4. La preuve

- **Vitest** (`tests/unit/calculs-4b-composes.test.js`, 27 tests) :
  - `assainirCalculs` et `refusCalculs` : jetons, clés, bornes, identifiants ;
  - la résolution de `perso:`, et l'introuvable, sans note ni repli ;
  - **l'équivalence de « Retoucher »** : la grille de valeurs du banc de 4a, chaque réglage à son défaut, son min et son max, chaque choix « vaut 0 » offert. Plus de 5 000 cas, note à 1e-9, même niveau sur les deux IDME ;
  - « vaut 0 » d'un calcul composé ;
  - le compte brut ;
  - les messages de « Garder » ;
  - l'identifiant jamais réemployé ;
  - « Retirer » refusé pour la note ;
  - dix calculs au plus ;
  - l'aller-retour import et partage, nom piégé compris ;
  - le nombre à la virgule ;
  - la chaîne d'étapes.
- **Break-tests** (chacun restauré, `cmp` identique), sept au total :
  - Vitest : le repli historique pour un calcul introuvable fait rougir B.b ; le réglage oublié dans la retouche, C.a et C.b ; le retrait sans garde, F.d ; le compteur ignoré, F.c ; `refusCalculs` débranché, G.b ; le nom sans sa borne, A.b ;
  - WebKit : « Garder » sans choisir la carte fait rougir trois essais.
- **Playwright WebKit** (`critere-algorithmique-calculs-4b.spec.js`, 11 essais et les captures) :
  - « Retoucher ce calcul », changer un nombre (2,5), « Garder » : la carte choisie, la copie fictive, la chaîne ; le retour au calcul tout fait retrouve 2 ;
  - composer de zéro « Pondération du critère − Compte pondéré des erreurs × 3 », puis « Modifier », « Garder les changements » ;
  - les refus (sans nom, vide, incomplet, division par 0, parenthèse) : rien ne s'écrit ;
  - « Retirer » refusé, puis confirmé pour un autre (« Annuler » d'abord) ;
  - le redessin : focus, défilement, brouillon et ouverture gardés ;
  - **une vraie copie évaluée**, codes posés dans Annoter : « Note = 20 − 3 × 2,5 = 12,5 / 20 », D ;
  - **la copie verrouillée** après « Retoucher… Garder » : 70 % et la ligne « elle serait de 85 % », rien d'écrit ;
  - 1 440, 1 180, 820 et 700 px : aucun défilement de côté, rien ne dépasse du composeur, aucune cible sous 44 px.

  Le banc de 4a est toujours vert.
- **Bancs voisins** : les 78 specs WebKit qui touchent le registre, le gabarit, l'atelier, le partage, l'import ou la saisie algorithmique (choisies par `grep`) : 147 tests, 139 réussis, 8 sautés (captures sur demande), 0 échec, aucun instable.
- **Captures** (`plans de travail/captures-2026-10-27-calculs-4b/`, `CAPTURES_CALCULS_4B=<dossier>`) : le composeur ouvert et une carte de calcul composé, 1 440 et 820 px, clair et sombre, les deux disciplines. Je les ai relues : le titre du composeur était coupé en deux colonnes à 820 px, et c'est corrigé.
- **Sentinelles ajustées, chacune avec son motif** :
  - #467 : `grilles.js` 109 → 112 ;
  - le miroir A.b : l'appel porte maintenant `compte` ;
  - complexité : `validerValeur` (partage) ramenée de 36 à 28 en extrayant le cas « tableau » et le nouveau type.

## 5. Portes terrain : aucune

Les deux règles de tête du skill s'appliquent : la machine répond (WebKit, quatre largeurs), et aucun raté n'est irréversible (rien ne s'écrit avant « Garder », et une copie remise garde sa note, lot #1173). **Ce que je n'ai pas pu vérifier** : l'iPad réel, c'est-à-dire le clavier décimal du champ « Nombre » (`inputmode="decimal"`) et les menus natifs « vaut 0 ».

## 6. Ce qui n'entre pas (§ 8)

« Ce calcul sert » et un calcul pour les phrases ou les tables (4c) ; des fonctions ; un calcul qui en lit un autre ; l'Aide. Pas de release, de verdict ni de push.
