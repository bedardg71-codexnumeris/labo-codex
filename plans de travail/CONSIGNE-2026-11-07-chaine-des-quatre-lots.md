# Consigne — la chaîne des quatre lots sur `lot/en-tete-epure` (7 nov. 2026)

Reçue de Cowork le 7 novembre 2026, en fin d'après-midi, après le rapport de l'en-tête épuré. Recopiée ici pour la
trace ; les consignes détaillées de l'en-tête et de l'accueil restent dans leurs fichiers.

## L'ordre

Quatre lots, enchaînés sur la même branche, chacun soumis à Grégoire (captures) et approuvé avant le suivant :

1. « L'en-tête épuré » — **approuvé par Grégoire sur ses appareils** (7 nov.), plus #1240 ci-dessous.
2. « L'accueil épuré » — `CONSIGNE-LOT-2026-11-07-accueil-epure.md`.
3. « Les pages sans doublons » — son inventaire d'abord, soumis à Grégoire.
4. « Les pages sans emboîtement » — son inventaire d'abord, soumis à Grégoire.

Pas de fusion vers `main` ni de publication sans l'accord de Grégoire, rien au changelog. **Un seul verdict
Playwright complet**, après l'accord sur le quatrième lot ; puis les Nouvelles des quatre lots proposées à Grégoire,
avant toute mise en ligne.

## Décisions sur le rapport de l'en-tête

1. **#1240, le témoin « Non enregistré »** : il ne doit jamais couvrir un bouton. Sous le seuil où il chevauche, il
   quitte sa position flottante et prend place dans le flux de la page, juste au-dessus de « ← Précédent /
   Suivant → ». Dans ce lot, avec une spec qui vérifie que les deux boutons restent touchables à 360 et 390 px.
2. **Le défilement** (ce qui reste collé en haut) : accepté tel quel pour ce lot ; #1239 le reprendra.
3. **Ajout à l'étape 1 de « Les pages sans doublons »** (l'inventaire) : toutes les mentions d'un onglet par son
   ancien libellé long dans l'Aide, la visite guidée, les infobulles et le glossaire. À l'étape 2, elles passent
   aux libellés courts validés, sans autre changement de texte. Le glossaire : « le bouton Assistance de
   l'en-tête » devient « la ligne Assistance du menu ».

## Lot 4 — « Les pages sans emboîtement »

Maquette : toile « En-tête et accueil », esquisse 68 (Évaluation › Préparer).

**La règle, validée par Grégoire.** Le contenu d'une page pose directement sur le fond de la page. Au plus un
niveau de carte, pour regrouper des éléments qui vont ensemble ; jamais de carte dans une carte. Les étapes
numérotées se distinguent par leur numéro, leur titre et l'espace qui les sépare, sans cadre. Un cadre reste
quand il a une fonction : une zone de dépôt de fichiers, un champ de saisie, une palette flottante, une fenêtre,
un canevas comme celui de la carte d'alignement, une copie à annoter.

**Étape 1, inventaire sans coder.** Les pages où le contenu est pris dans deux niveaux de cadres ou plus
(panneau, carte, sous-carte) : section › onglet, nombre de niveaux, ce que chaque cadre contient, et les cadres
qui ont une fonction au sens ci-dessus. Si un composant commun produit l'emboîtement sur plusieurs pages, le
dire : c'est là qu'il faut agir. Attendre l'accord de Grégoire avant l'étape 2.

**Étape 2.** Commencer par Évaluation › Préparer, comme l'esquisse 68 : le panneau blanc, la carte blanche
ombrée et la carte grise de l'étape disparaissent ; l'étape devient sa pastille numérotée et son titre ; la zone
de dépôt garde ses pointillés et prend toute la largeur du contenu. Puis les autres pages de l'inventaire
approuvé, par la même règle. Aucun comportement ni aucun texte ne change. Vérifier le sombre et le clair : sans
cadre, les contrastes du texte sur le fond de la page restent d'au moins 4,5:1.

**Livraison.** Captures Playwright WebKit, avant et après, en sombre et en clair, à 1180 et 820 px :
Évaluation › Préparer, puis une page par section modifiée.
