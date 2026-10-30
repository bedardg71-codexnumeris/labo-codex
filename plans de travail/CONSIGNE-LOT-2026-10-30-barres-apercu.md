# Consigne – Les barres colorées de l'Aperçu : passages larges, voile, axe au choix

> Cowork, vendredi 30 octobre 2026, 15 h 38 (Toronto). Décisions de Grégoire de 15 h 37 et 15 h 38 (`REFLEXION-2026-10-30-seuils-normatif-critere-ipsatif.md`, section « Les barres colorées de l'Aperçu »). Ébauche de référence : https://claude.ai/artifact/J3QensrzUMhxTdViLgXvN1 (lis son script : `fond()`, variante « large », et `axe()`, variante « deux »). À faire après le lot du niveau RàI au critère, pas en même temps (`tableau-bord-apercu.js` est commun).

## 1. Les couleurs : passages larges, pour tout le monde

`fondDeLaBarre` (`js/tableau-bord-apercu.js`) dessine des aplats aux bords francs. Il dessine désormais, entre deux zones voisines, un passage centré sur la borne, de demi-largeur égale à la moitié de la plus étroite des deux zones visibles (au moins 1,5 point) : le milieu du passage tombe exactement sur le seuil. Mêmes couleurs que les pastilles (`COULEUR_BANDE`), mêmes bornes (`zonesDeLaBarre`). Garde : une sentinelle qui vérifie que la couleur au seuil est le mélange à parts égales des deux zones, pour A, C et P.

## 2. Le voile : gardé

`.barre-indicateur-overlay` reste, sans changement.

## 3. L'axe de A et de C : un réglage, proportionnel par défaut

- Deux choix, pas trois : « proportionnel » (30 → 100, comme aujourd'hui, **le défaut**) et « deux segments » (de 30 jusqu'au seuil le plus bas de A et C dans le premier quart de la barre ; du seuil le plus bas à 100 dans les trois autres). P garde toujours l'axe proportionnel.
- Le seuil le plus bas est lu à sa source (les trois champs de Labo › Outils d'observation), jamais écrit en dur.
- Le réglage vit dans Labo › Outils d'observation, avec sous les yeux un exemple de chaque cas (une petite barre d'exemple pour chacun, comme l'ébauche). Une seule fonction d'axe pour la position des points, de la moyenne, de la courbe, des traits pointillés et des graduations (aujourd'hui `positionSurEchelleDistribution`) ; les graduations disent la cassure.
- Rien n'est écrit dans les réglages déjà enregistrés : sans choix, c'est le défaut.
- Les mots du réglage et de ses exemples : à proposer, à faire valider par Grégoire.

## 4. Fin

Commit, Vitest entier, specs WebKit touchées ; pas de release. Une capture Mac (Chrome) des trois barres dans chacun des deux axes, pour Grégoire. Relecture de Cowork.
