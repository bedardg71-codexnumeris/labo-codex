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
