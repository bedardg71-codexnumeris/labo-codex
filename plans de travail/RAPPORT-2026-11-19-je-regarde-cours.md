# Rapport, 20 nov. 2026 (session de nuit B), lot 3 : « Je regarde » de « Monter ton cours »

**Dernier relais.** Branche `lot/je-regarde-cours`. Consigne : `plans de travail/CONSIGNE-2026-11-19-je-regarde-cours.md` (le relais du 19 nov., 16 h, mot pour mot, avec ce que le mandat de la nuit y change). EN COURS : la base et les six mesures sont ci-dessous ; le code suit.

## 0. La base et les têtes prises

- **Préalable** : `origin/lot/nous-faisons-cours` existe avec son rapport (`edba41b3`, PR n° 36). **Les deux retouches de mots y sont déjà** (« tes évaluations devront le vérifier », bulle 4 ; « ton plan de cours le précisera », bulle 6), codées dès le lot 2 (changement 2 du mandat) : aucun commit de plus.
- **Branche** `lot/je-regarde-cours`, partie de `origin/lot/nous-faisons-cours` à **`edba41b3`**.
- **Fusion** : `git merge --no-ff origin/lot/je-regarde-evaluer` (**`a31aaa34`**, PR n° 30, la Modélisation d'« Évaluer », qui crée la production du modèle), commit `1a9d2e4a`. Conflits tranchés en gardant les deux côtés : `index.html` (le bloc des parcours du lot 2, avec `js/parcours-evaluer.js` de la PR n° 30 et son commentaire sous un jeton neuf `20261119y` ; les quatre `js/materiel*.js` de la PR n° 30 aussi à `20261119y`, leur jeton du 17 nov. étant plus vieux que le build de `main`) ; `BACKLOG.md` (le dernier ID du lot 2, #1296, avec la mention de #1287 pris sur la PR n° 30).
- Les commits qui ouvrent les parcours sur la branche restent (c'est un aperçu, à annuler avant toute fusion) : `4c36db4` (venu de `claude/ecstatic-brown-urn6v8`) et **`52a12f6d`** (`monter`, lot 2).

## 1. Les six mesures, avant le code

Sonde non gardée, Chromium, 1180 × 820 : un espace vide, la Modélisation de « Mettre ta classe en place », « Voir le parcours suivant », la Modélisation d'« Évaluer », « Terminer » ; puis les mesures.

### (a) La carte : une carte neuve, rattachée au cours du deuxième groupe, dans la démo

- Dans la démo, après les deux modèles, le groupe actif est le deuxième groupe (`D2025-601-999-DM-00002 (Mar-AM / Ven-AM)`) et le cours actif est le sien. **Conception › Alignement montre `carte_1`, « Écriture et littérature (démo) », la seule carte de la démo, rattachée à aucun cours.**
- `planificationCarte.nouvelleCarte(nom)`, appelée dans la démo, crée `carte_2`, **rattachée au cours actif** (celui du deuxième groupe) et l'ouvre ; les données de la carte vivent sous `demo_planification_mindmap`.
- ⮕ `lancerModele` cherche dans la démo une carte rattachée au cours du deuxième groupe ; sans elle, il en crée une, vide, et l'ouvre. **Son nom : celui du cours du deuxième groupe, « Littérature et imaginaire »** (le matériel du modèle de « Mettre ta classe en place ») : supposé, aucun mot n'est inventé. `carte_1` n'est pas touchée.

### (b) Le confinement : rien n'est écrit hors de la démo

Relevé de toutes les clés (IndexedDB et `localStorage`) avant et après : une carte créée, neuf blocs posés, un objectif écrit, des objectifs cochés, l'Inspecteur ouvert sur trois leçons. **Clés changées hors de la démo : aucune.** Le banc du modèle refera ce relevé de bout en bout.

### (c) Une activité d'une autre leçon NE PEUT PAS servir l'objectif de la première leçon

- `objectifsServisPar` (`js/planification-carte.js`) ne retient d'un bloc que les objectifs de **sa** leçon. Mesuré : l'objectif « Choisir les stratégies de lecture. » coché sur les trois activités, seule la modélisation (dans la première leçon) le sert ; « Marine » (deuxième leçon) et l'autoévaluation (troisième) : **0**. L'Inspecteur d'une activité ne propose d'ailleurs que les objectifs de sa leçon.
- Les pastilles de l'évaluation (qui vérifie l'objectif), selon sa place :

| Place de l'évaluation | Pastille |
|---|---|
| troisième leçon, sous l'autoévaluation | « ✓ » (`avant`) |
| troisième leçon, **au-dessus** de l'autoévaluation | « ✓ » (`avant`) |
| deuxième leçon | « ✓ » |
| première leçon, sous la modélisation | « ✓ » |
| première leçon, au-dessus de la modélisation | **« ⚠ »** (`apres`) |

- ⮕ **Deux choses ne tiennent pas techniquement** (signalées, pas remplacées) :
  1. Bulle 6, « Ces activités servent toutes le même objectif. » : les deux activités de la deuxième leçon et l'autoévaluation ne peuvent pas servir l'objectif de la première leçon. « Remplir » ne les coche donc pas (l'application ignorerait la coche).
  2. La **seconde forme** de la bulle 6 (« La pastille affiche « ⚠ » : dans la leçon, l'évaluation vient avant l'autoévaluation… ») décrit un cas où la pastille reste « ✓ » : elle ne paraîtrait jamais. Le seul « ⚠ » est l'évaluation glissée **au-dessus de la modélisation, dans la première leçon** : une autre pastille, dans une autre leçon. **Cowork proposera à Grégoire les mots de cette forme-là** (relais, bulle 6). D'ici là, cette forme n'est pas codée : l'étape attend que l'évaluation soit à sa place, sans bulle propre.
- À la fin du modèle (l'évaluation sous l'autoévaluation, la production choisie), le banc lit les pastilles : voir § 7.

### (d) La durée d'une activité : `metadata.duree`, en minutes ; 1 période = 50 minutes dans la démo

Le bloc porte un champ « Durée estimée, en minutes » (`.planif-noeud-duree`, `metadata.duree`) ; la durée d'une période vient du Cadre (`obtenirDureePeriode`, 50 dans la démo). « Remplir » y met **une période** (`dureePeriodeMinutes()`), pour chaque activité.

### (e) Les dates des trois leçons (horaire du deuxième groupe, « Mar-Ven »)

Lues dans l'Inspecteur (`#planif-panneau-date`) :

| Leçon | Semaine, séance | Date |
|---|---|---|
| « La méthode : manuel, postures, stratégies » | S2, séance A | **vendredi 29 août** |
| « Les stratégies de lecture à l'essai » | S2, séance B (une séance plus tard) | **mardi 2 septembre** |
| « Retour sur « Fendant Rioux » » | S3, séance A (la séance qui suit) | **vendredi 5 septembre** |

Les trois tombent avant l'échéance de l'Artefact 1 (le mardi 9 septembre 2025). ⚠ La bulle 3 dit « S2, séance A (la première rencontre de la semaine) » : dans le calendrier de la démo, la première rencontre de la semaine 2 est un **vendredi** (la semaine compte ses séances, pas les jours du calendrier) ; les mots ne changent pas, c'est dit ici.

### (f) Les boutons de fin : « Le refaire avec ma classe » et « Terminer »

Le parcours qui suit, « Mettre tes données à l'abri » (`donnees`), n'a pas de Modélisation (`lancerModele` absent) : les suites du modèle (`suitesDuModele`, `js/parcours-classe.js`) n'offrent pas « Voir le parcours suivant ». Dans les bancs, qui rouvrent tous les parcours, comme dans l'aperçu, où `donnees` est fermé : **« Le refaire avec ma classe » et « Terminer »**, de même poids, et la consigne qui suit ses boutons, « Touche « Le refaire avec ma classe », ou « Terminer » ».

## 2. Le modèle (le code)

- **`js/parcours-cours.js`** : `etapesModele()` (sept bulles), `lancerModele`, `refusModele`, et `totalModele: 7` déclarés sur la définition (`Assistance.enregistrer`). Les outils communs des modèles viennent de `window.ParcoursClasse` (`remplir`, qui n'écrit que dans la démo ; `poser` ; `mots.remplir` ; `suitesDuModele` et `consigneDesSuites` pour la fin ; `deuxiemeGroupe`) ; la ligne du choix du groupe, de `window.ParcoursEvaluer.textes.choisirLeGroupe` (le modèle d'« Évaluer »). `js/parcours-classe.js` n'est pas touché.
- **Les trois temps**, par étape : à l'ouverture, les explications et le geste de la page (le bouton de la palette ; à la bulle 4, le badge 🎯) ; le bloc posé, la seule consigne « Regarde l'exemple se remplir : touche « Remplir » » et le bouton « Remplir » ; rempli, la seconde forme (`secondeForme` : le moteur retire l'objectif, la confirmation et le lieu), ce qui vient d'apparaître, les gestes, la consigne, ce qui suit. Bulles 1 et 4 : « Continuer » dans la bulle.
- **La carte du modèle** (mesure a) : `ouvrirLaCarteDuModele`, dans la démo, sur le deuxième groupe ; la veille du parcours l'ouvre dès que le deuxième groupe devient le groupe actif.
- **Le contexte du modèle** vit en mémoire (`enModele`, `ctxModele`, comme le modèle d'« Évaluer ») : la préférence de la Pratique guidée n'est jamais touchée. `noeudsAvant` est vide (la carte est au modèle : tout ce qu'elle porte compte). Le modèle repart de sa première étape non faite (`premiereNonFaiteModele`), jamais en visite.
- **La confirmation** : de ce passage seulement, comme au lot 2 (`debutDuPassage`).
- **Ce que « Remplir » écrit**, par les gestes de la page (l'événement que la carte écoute ; elle enregistre elle-même) : le titre du bloc (étapes 1, 2, 3, 5, 6) ; la semaine (S2) et la séance (A) par les sélecteurs de l'en-tête (étape 3) ; l'objectif par `definirObjectifsLecon` (étape 4) ; une période (50 min) dans le champ de durée (étape 5) ; à l'étape 6, les deux leçons, leurs trois activités (une période chacune), leurs liens à l'idée maîtresse (`injecterNoeuds`).
- ⚠ **Supposé** : à l'étape 6, « Remplir » pose aussi l'évaluation juste au-dessus de la dernière leçon (sa place seulement ; le glisser reste le geste de la personne), et la vue amène les deux ensemble (`amenerEnsemble`, qui généralise `amenerLeBloc`) ; la bulle les laisse libres (ses zones). Sans cela, mesuré à 1180 × 820, la dernière leçon tombait sous la palette « Planificateur » et sous la bulle, et l'évaluation hors de la vue.
- Jeton `?v=` de `js/parcours-cours.js` : `20261119y`.

## 3. Pour chaque étape : l'écran, ce qui est pointé, le geste, ce qui fait avancer

| Étape | Écran | Pointé (contour) | Geste de la personne | Avance sur |
|---|---|---|---|---|
| 1 Ta compétence | Conception › Alignement, la carte du modèle | le bouton « Compétence » | poser le bloc, « Remplir », « Continuer » | l'énoncé écrit et « Continuer » |
| 2 Ton idée maîtresse | la carte | « Idée maîtresse », puis les cercles de la compétence | poser, « Remplir », tirer le trait | le lien « se décline en » (`ideeReliee`) |
| 3 Ta leçon | la carte | « Leçon », puis les cercles de l'idée maîtresse | poser, « Remplir », tirer le trait | le lien « se concrétise dans » (`leconReliee`) |
| 4 Ton objectif | la carte | le badge 🎯 | le badge, « Remplir », « Continuer » | l'objectif écrit et « Continuer » |
| 5 Ton activité | la carte | « Activité », puis la zone de la leçon, la poignée, la case de l'Inspecteur | poser, « Remplir », glisser dans la leçon, toucher deux fois, cocher | l'objectif coché (`blocQuiSert`) |
| 6 Ton évaluation | la carte | « Évaluation », puis la dernière leçon | poser, « Remplir », glisser sous l'autoévaluation, toucher deux fois, cocher, choisir la production | la production choisie et la pastille « ✓ » (`evaluationAlignee`) |
| 7 Une chaîne alignée | la carte, la bulle au centre | rien | « Le refaire avec ma classe » ou « Terminer » | le bouton |

Hors du deuxième groupe, chaque bulle ne dit que « Choisis le deuxième groupe dans l'en-tête (ce modèle se joue sur lui) », le menu de l'en-tête pointé ; ni « Remplir » ni avance.

## 4. Les gestes qui se grisent, et ceux qui ne le peuvent pas

Se grisent (seconde forme) : bulle 2 et 3, la consigne du trait ; bulle 5, glisser dans la leçon, toucher deux fois (l'Inspecteur ouvert sur l'activité ; refermé, la ligne revient), cocher ; bulle 6, glisser sous l'autoévaluation (la place dans la dernière leçon), toucher deux fois, cocher, choisir la production. Ne se grisent pas : les consignes « Touche « Continuer » » et celles de « Remplir » (un bouton les fait) ; la consigne de la fin.

## 5. Ce qui ne tient pas, ou manque : SIGNALÉ, PAS REMPLACÉ

1. **Bulle 6, « Ces activités servent toutes le même objectif. »** (mesure c) : les activités des leçons 2 et 3 ne peuvent pas servir l'objectif de la leçon 1 ; « Remplir » ne les coche pas. La ligne reste, mot pour mot. **Cowork tranchera** (les mots, ou la règle de la carte, qui est une décision pédagogique de Grégoire).
2. **La seconde forme de la bulle 6** n'est pas codée (mesure c) : son cas (l'évaluation au-dessus de l'autoévaluation) garde la pastille « ✓ ». Le seul « ⚠ » : l'évaluation au-dessus de la modélisation, dans la première leçon ; l'étape attend alors, sans bulle propre. **Cowork proposera les mots** de cette forme-là.
3. **Bulle 3, « S2, séance A (la première rencontre de la semaine) »** : vrai ; dans la démo, cette rencontre est un vendredi (mesure e). Rien à changer, c'est dit.
4. **Le refus** (« Commence par la Modélisation d'« Évaluer une première production » : ce modèle place sa production dans ta carte. ») : **provisoire**, posé tel quel, **à soumettre à Grégoire**.
5. **La forme**, comme au lot 2 : pas de flèche devant un geste qui n'est pas la consigne ; la parenthèse d'une consigne (bulles 2 et 3) reste dans son texte, en gras.

## 6. Trouvaille hors lot (issue 2 de CLAUDE.md : inscrire et continuer)

**À 820 × 1180 (l'iPad en portrait), la part visible de la carte est étroite** : le « Planificateur » ouvert couvre la droite de la carte, où tombent les cercles et le badge 🎯 visés (mesuré : « couvert par planif-grille-cellule ») ; l'Inspecteur resté ouvert couvre l'autre moitié ; et la bulle de l'étape 6 (treize lignes) couvre la dernière leçon ou l'évaluation. La personne s'en sort en fermant le « Planificateur » (menu « Vue »), l'Inspecteur (×) et en déplaçant la bulle par sa poignée ; le banc le fait, et constate l'obstruction à l'étape 6. **Non inscrit au BACKLOG** (aucun symptôme vécu ; règle du 24 août) : à Cowork, qui verra si l'essai de Grégoire sur l'iPad le confirme. La même étroitesse vaut sans doute pour la Pratique guidée en portrait (inférence, non mesurée : ses bancs posent la carte par son API).

## 7. Les commits

| Commit | Ce qu'il fait |
|---|---|
| `1a9d2e4a` | fusion de `origin/lot/je-regarde-evaluer` (PR n° 30) : partie de l'aperçu |
| `d8d69ff4` | la consigne |
| `d39e9c6c` | ce rapport, avec les six mesures, avant le code |
| `d50df204` | le modèle, son banc ; jeton `20261119y` |
| `099c81b1` | la sentinelle du modèle ; `parcours-5` lit les boutons à deux temps |
| (lot 2) `52a12f6d` et `4c36db4` | **les commits qui ouvrent les parcours sur la branche : à annuler avant toute fusion** |

## 8. Les bancs et leurs break-tests

- **`tests/integration/je-regarde-cours-2026-11-19.spec.js`**, neuf, 1180 × 820 et 820 × 1180 : depuis un espace vide, la Modélisation de « Mettre ta classe en place », celle d'« Évaluer », puis ce modèle aux vrais gestes (palette, « Remplir », traits, glisser par la poignée, cases, production). Il juge chaque bulle en trois temps, ce que « Remplir » écrit (titres, S2 et A, l'objectif, une période, les deux leçons, leurs activités et leurs liens), la carte du modèle (« Littérature et imaginaire », rattachée au cours du deuxième groupe, la deuxième de la démo), la pastille de l'évaluation (« ✓ »), la fin (objectif atteint, « Le refaire avec ma classe » et « Terminer », leur consigne), la bulle 7 dans la fenêtre, et **le confinement : aucune clé hors de la démo ne change, `carte_1` identique**. Chaque geste attend sa cible immobile et libre. À 820 × 1180, voir § 6 (l'étape 6 rangée par la carte après avoir constaté l'obstruction). **3 verts sur 3 à chaque taille.** Break-tests : une écriture hors de la démo dans « Remplir » → rouge (« aucune clé hors de la démo ») ; la semaine oubliée → rouge ; la carte du modèle non créée → rouge.
- **`tests/unit/sentinelle-parcours-cours-modele-2026-11-19.test.js`**, neuve (24 essais) : chaque bulle temps par temps, confrontée au relais (le lecteur apparie les guillemets imbriqués) ; l'objectif, le lieu, l'objectif atteint, la fin ; le refus provisoire (sans deuxième groupe ou sans la production) ; le choix du groupe ; le matériel de « Remplir » ; la confirmation. Break-tests par mutation : un mot de la bulle 5, deux espaces en fin d'une explication, un mot du refus, « Continuer » retiré de la bulle 4, un mot du matériel → 1 rouge chacun.
- **`parcours-5-monter-ton-cours-2026-11-09.spec.js`** : au panneau, « Je regarde » et « Nous faisons » (le nom, pas l'état), comme les autres parcours à deux temps.
