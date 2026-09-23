# Consigne du jour – Lot N4 : spécifications, aucune note inventée sous le premier forfait, et la réédition qui ne perd rien (#713 volet plancher, #854 volet SPE)

> Écrite le 23 septembre 2026, 8 h 25 (Toronto), par Cowork, sur `origin/main` = `7ebdf47f` (1.155.3, en production chez Netlify depuis 8 h 16, déploiement mesuré). **Proposée** tant que Grégoire ne l'a pas relayée.
> La précédente (lot N7, livrée en 1.155.3) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-23-lot-n7-echelle.md` (déplacée par Cowork, à commiter avec ce lot).
> **Les fiches font foi** : `BACKLOG.md`, #713 (≈ l. 784, volet plancher ; le volet registre est livré en 1.153.0) et #854 (≈ l. 819, volet spécifications). Premier lot de l'ordre dans `plans de travail/FILE-DES-LOTS.md` (N4, N5, N6).

## 0 · La décision de Grégoire (23 sept. 2026, 8 h 20) – elle fait foi

Question posée par Cowork : quand le collègue n'a pas fixé de note pour « aucun forfait atteint », que doit dire l'application ? A, aucune note, avec la cause nommée ; B, 0 ; C, garder 50. **Réponse : A.**

Elle applique son principe du 22 sept. (inscrit en tête de la consigne N7) : **« Il faut toujours prendre les grilles, échelles, cartouches, etc. créés par l'utilisateur. »** Un 50 codé en dur, un 0 codé en dur ou une suite de notes par défaut, c'est la même chose : rien que l'utilisateur n'ait créé.

Mots d'écran proposés par Cowork et approuvés dans leur sens par Grégoire (à reprendre tels quels, ou au plus près, là où la cause s'affiche) : **« Ta pratique ne dit pas quelle note donner quand aucun forfait n'est atteint. »**

## 1 · Ce que Cowork a mesuré (lecture seule, 8 h 20) – deux moteurs portent le plancher

- **Le moteur des spécifications** : `_determinerPalierBundle` (`js/pratiques/pratique-pan-specifications.js:801`) rend le forfait le plus élevé atteint ; sinon le palier sans `requis` (« palier d'échec ») si le collègue l'a créé ; **sinon `50`, codé en dur (l. 823)**. C'est ce 50 qu'exporte le « modèle simple » adopté tel quel, en « final » (constat B-3 de l'audit du 16 sept.).
- **La configurable** : `PratiqueConfigurable.calculerParSpecifications` (`js/pratiques/pratique-configurable.js:887`), appelée par `calculerNoteFinale` (l. 727) quand `calcul_note.methode === 'specifications'`. Elle porte **sa propre** suite par défaut `[100, 80, 60, 50]` (≈ l. 914) quand l'échelle n'a pas `notes_possibles`, prend la plus basse quand rien n'est atteint, et **rend `0` sans spécifications configurées** (l. 891). Mesure si ce chemin est encore atteint par une pratique réelle (la délégation « specifications » de la l. 223 envoie ailleurs) : s'il est vivant, il suit la même règle ; s'il est mort, il part (zéro-dette).
- **La résolution de la note** : `calculerNoteDuCours` (`portfolio.js`, lot N2) sait déjà lire `null` comme « non constructible » (l'indice P stocké, l'export, la courbe du Suivi) : c'est le canal de la règle A.

## 2 · Ce que fait le lot

**2a. Aucun forfait atteint, aucun palier d'échec créé par le collègue : aucune note.** Le moteur rend `null` (non constructible), jamais 50, jamais 0. Là où la note s'affiche « — » pour une note non constructible (profil, carte de la note, export, Suivi), la cause s'écrit avec la phrase du §0. L'endroit où la cause se déclare et se propage relève de toi : une seule source, que tous les écrans lisent.

**2b. Le palier d'échec créé par le collègue est respecté.** S'il existe, sa note s'applique comme aujourd'hui. Un essai le fige.

**2c. Aucune note par défaut ne subsiste dans les deux moteurs** : ni `50`, ni `[100, 80, 60, 50]`, ni `0` pour « pas de spécifications ». Sans forfaits configurés, la pratique n'est pas constructible (cause nommée par la voie existante de #709 / #790 si elle couvre le cas ; sinon, la même source qu'en 2a).

**2d. La réédition par l'assistant ne perd plus rien (#854, volet SPE).** Rouvrir une pratique par spécifications dans l'assistant et l'enregistrer sans rien changer doit laisser sa configuration identique : seuil d'acceptabilité, forfaits, palier d'échec, jetons. Aujourd'hui `chargerPratiqueExistante` (`js/wizard-pratique-v2.js:2997`) ne restaure pas les réponses jetons (réécrites à `{activer:false}`), et le seuil repasse à sa valeur par défaut. Le test qui départage : **ouvrir, enregistrer sans toucher, comparer la configuration avant et après : égales à l'octet** (sauf les dates de modification, que tu nommes). **Décidé par Cowork (technique).**

**2e. Le stock.** Aucune donnée n'est réécrite. Une note de 50 déjà exportée reste ce qu'elle est dans le fichier exporté ; l'indice P stocké se recalcule au démarrage, comme toujours. Dis dans le rapport combien d'élèves des données d'essai passent de 50 à « — ».

## 3 · À mesurer et à inscrire, pas à corriger

Les **seuils d'acceptabilité par défaut** ne concordent pas et sont écrits en dur : `75` à l'assistant et au formulaire (`pratiques-bibliotheque.js:503`, `:564` ; `pratiques-gestion.js:1262` ; `pratique-notation-v2.js:609`), `60` dans le moteur (`pratique-pan-specifications.js:784`, `seuilAcceptable || 60`, et `spec.seuil || 60` dans la configurable). **Ce qu'est « acceptable » est de la didactique** : ne tranche pas. Mesure si un chemin réel atteint le défaut du moteur (un type de travail sans seuil écrit) et inscris une fiche (issue 2) avec ta mesure. Cowork portera la question à Grégoire.

## 4 · Arrêt prévu

Si la règle A fait disparaître la note d'un élève dans un cas que le §2 ne décrit pas (par exemple une spécification configurée dont la suite par défaut portait en réalité le forfait atteint), **arrête-toi et dis lequel**.

## 5 · Tests

- Modèle simple adopté tel quel, un élève sans forfait : note `null`, cause nommée, « — » au profil et à l'export ; un élève avec un forfait : la note du forfait, inchangée.
- Palier d'échec créé par le collègue : sa note s'applique.
- La configurable par spécifications (si le chemin est vivant) : même règle, aucune suite par défaut.
- Réédition par l'assistant : ouvrir, enregistrer sans toucher, configuration égale (seuil, forfaits, palier d'échec, jetons actifs et désactivés).
- Sentinelle : ni `: 50` en repli de note, ni `[100, 80, 60, 50]` dans les deux moteurs.
- Break-test sur chaque assertion ; suite Vitest complète verte.

## 6 · Livraison

- Version **patch** par `scripts/release.mjs`. Item de « Nouvelles » **proposé, à valider par Grégoire avant le push** : il dit qu'un élève sans forfait n'a plus de note tant que la pratique n'en prévoit pas, et où la prévoir.
- Commit, relecture de Cowork, corrections, verdict, push.

## 7 · Le geste que Grégoire vérifiera à l'écran (s'il le souhaite)

Il n'utilise pas les spécifications : aucun geste sur ses données. Le lot se prouve par les tests.
