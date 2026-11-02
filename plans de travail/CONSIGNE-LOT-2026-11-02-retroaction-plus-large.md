# Consigne – La palette Rétroaction s'ouvre plus large (2 novembre 2026)

> Écrite par Cowork le lundi 2 novembre 2026 à 8 h 03 (Toronto, mesuré par `date`), sur `main` = `2acef748`. **À lancer après le lot de mesure des tampons**, une seule session à la fois.
> **Décision de Grégoire** (porte 3.2 de la 1.230, 8 h 02) : « On peut aller plus large avec la palette Rétroaction, car j'ai besoin de lire le texte que l'élève recevra. À ce stade du travail, l'annotation est terminée et la relecture de la copie est plus globale. C'est le retour à l'élève qui compte plus. »
> **Et sa règle pour la copie** (porte 3.1) : ce qui compte, c'est la largeur visible entre les palettes pour lire l'écriture manuscrite d'une marge à l'autre ; le défilement vertical ne le gêne pas. En **Évaluer**, il accepte que la copie cède de la largeur à la Rétroaction ; en **Annoter**, rien ne change.

## 0. Avant tout

- Commit de docs seul : cette consigne.

## 1. Mesure d'abord

À 1180 × 820 et 1280 × 720, en Évaluer, hors plein écran puis en plein écran : la largeur de la Rétroaction, le nombre moyen de caractères par ligne dans son texte (une rétroaction de démo réelle, noms fictifs), si les trois boutons du pied tiennent sur une rangée, et la largeur libre de la copie. Le tableau va en tête du rapport.

## 2. Le correctif (décision de Cowork sur la largeur)

La Rétroaction s'ouvre à la largeur où son texte compte **environ 50 caractères par ligne** (lisible d'un trait), **et au moins** celle où les trois boutons du pied tiennent sur une rangée. Évaluation se décale avec elle, comme aujourd'hui ; Paramètres ne bouge pas. Une largeur déjà posée à la poignée l'emporte, comme aujourd'hui. Dis au rapport la largeur retenue et ce que la copie y perd.

## 3. Les tests

- Un essai garde : le pied sur une rangée, la ligne du texte dans 45 à 55 caractères, Évaluation contre la Rétroaction, rien hors de la zone en bandeau. Mets à jour l'essai qui fixait la Rétroaction à 200 et la copie à 432 : sa nouvelle valeur vient de la mesure.
- Contre-épreuves (skill `verification-adverse`).

## 4. Fin

Commit, Vitest entier, specs touchées. **Pas de release ni de verdict** : ce lot partira avec la prochaine mise en ligne. Rapport `RAPPORT-2026-11-02-retroaction-plus-large.md` à Cowork.
