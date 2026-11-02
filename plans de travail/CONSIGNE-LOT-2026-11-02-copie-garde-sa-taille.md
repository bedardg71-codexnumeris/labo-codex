# Consigne – La copie garde sa taille d'ouverture, et le témoin du zoom suit (2 novembre 2026)

> Écrite par Cowork le lundi 2 novembre 2026 à 4 h 37 (Toronto, mesuré par `date`), sur `main` = `1a9ee154` (la 1.230.0 commitée, non poussée ; jeton rouge).
> Lu par Cowork : `RAPPORT-2026-11-01-verdict-rouge-1230.md`. **Analyse acceptée** : le zoom marche (1,50, aucun saut), le témoin de 500 px et le point visé ont vieilli avec `67e2f649`.
> **Ce que le rapport révèle à côté, et qui décide ce lot** : hors plein écran, depuis `67e2f649`, la copie s'ouvre 43 % plus étroite (212 px contre 373 à 1280 × 720). `ZOOM_FIT` (`calculerZoomEffectif`, `calculerZoomImage`, `js/travaux-visionneuse.js`) ajuste à la hauteur du cadre, et la partie C l'a raccourci de 241 px. Le but de Grégoire pour cette série (1er nov., matin) : le plus de place possible à la copie.
> **Décision de Cowork** : la zone reste dans l'écran (les palettes entières à la vue, le gain de la partie C), et **la copie garde à l'ouverture la taille qu'elle avait dans la 1.229.0** ; ce qui dépasse le cadre se parcourt dans le cadre, comme après un zoom. Rien ne change en plein écran si la mesure y montre déjà la taille de la 1.229.0.

## 0. Avant tout

- Commit de docs seul : cette consigne.
- Aucune autre session ne tourne.

## 1. Mesure d'abord

La largeur du document à l'ouverture d'une copie (PDF **et** image), sur `6ab4f080` (la 1.229.0) et sur `main`, à 1180 × 820 et à 1280 × 720, hors plein écran et en plein écran. Le tableau va en tête du rapport. Note aussi ce que fait « Ajuster » (`zoomAjuster`) après un zoom.

## 2. Le correctif

En mode `ZOOM_FIT`, la taille d'ouverture ne se tire plus de la hauteur du cadre raccourci : elle rend la largeur de la 1.229.0 sur le même écran (à 2 px près), sans dépasser la largeur du cadre. Le moyen est à toi ; dis-le en une ligne. « Ajuster » suit la même règle. Le défilement du document dans son cadre (deux doigts, molette) doit atteindre le bas de la page.

## 3. Le témoin du zoom (`annotation-deux-doigts-page.spec.js`)

Ta proposition, retenue : le témoin devient un rapport (largeur après > 1,4 × largeur avant), et le point visé est pris dans la page, d'après le document, plutôt qu'en pixels fixes.

## 4. Les tests

- Un essai garde la largeur d'ouverture hors plein écran, à 1180 × 820, à la valeur de la 1.229.0 ; un autre, que le bas de la page s'atteint.
- Rejoue toutes les specs `annotation-*`, `palette-*`, `barre-outils-compacte`, `tampons-masques-bibliotheque-1216` et celles de la visionneuse : la partie C en a déjà surpris une.
- Contre-épreuves (skill `verification-adverse`).

## 5. Fin

Commit, Vitest entier. La version reste **1.230.0** : refais le build et les jetons selon le skill `release-et-changelog` (pas de nouveau numéro), les Nouvelles ne changent pas. Rapport `RAPPORT-2026-11-02-copie-garde-sa-taille.md` à Cowork.

Puis **la vérification complète, au signal de Grégoire** : « ferme Cowork, Chrome et Safari sur le Mac, je lance la vérification » ; Mac sur secteur, sans veille. Vert : `git push`. Rouge : ne pousse pas, rapport à Cowork.
