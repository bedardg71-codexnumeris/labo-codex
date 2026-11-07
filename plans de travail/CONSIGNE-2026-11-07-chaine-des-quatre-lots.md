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

## Lot 3 — « Les pages sans doublons » (consigne reçue le 7 nov. au soir, en deux collages)

Maquette : toile « En-tête et accueil », esquisse 67 (la carte d'alignement).

**Étape 1, inventaire sans coder.** Trois listes, page par page : les titres de page qui répètent le libellé de leur
onglet et toute ligne de description sous ces titres (texte exact) ; les pages qui donnent accès à une
bibliothèque (libellé, emplacement, style) ; les pages qui affichent une frise d'étapes comme celle de la carte.
Fait : `INVENTAIRE-2026-11-07-pages-sans-doublons.md`.

**Étape 2, après l'accord de Grégoire.**
- Titres : retirer de l'écran tout titre qui répète son onglet ; le garder pour les lecteurs d'écran. Ne retirer
  aucune ligne de description sauf celles que Grégoire désignera. Carte d'alignement, déjà décidé : retirer
  « Organiser visuellement les séquences, leçons et activités du cours » et « Évaluer ce qu'on enseigne, et
  enseigner ce qu'on évalue, au même niveau d'exigence. » (la maxime ouvre déjà la page 1 du guide).
- Conception › Mon matériel : retirer l'avertissement « Cet outil est en développement : certaines grilles
  pourraient mal s'y afficher. D'autres étapes viendront, dont les rétroactions. »
- Bibliothèques : partout le même bouton « Consulter la bibliothèque », au même endroit et dans le même style que
  sur Productions, Grilles, Échelles, Cartouches, Pratiques. Uniformiser les écarts ; ne rien renommer.
  Comportement inchangé.
- Carte d'alignement : une seule rangée d'outils. À gauche : « Consulter la bibliothèque », le sélecteur du
  document (le nom, puis « en vigueur » en vert plus pâle), Actions ; un filet ; Annuler, Rétablir et Rechercher
  en icônes seules, avec infobulles et aria-label (la recherche s'ouvre au toucher). À droite : le sélecteur
  Nœuds / Planificateur en segments, Vue ; un filet ; Inspecteur, Guide. Comportements inchangés.
- Frises : la frise compacte de l'esquisse 67, dans le composant commun. Une ligne d'environ 38 px, chaque étape
  en petit (coche verte, nom, nombre), séparées par un chevron discret ; une étape manquante prend une icône
  d'alerte et un fond orange léger.
- Les 160 mentions passent mécaniquement aux libellés courts, avec les états vides d'Annoter et d'Exporter.

**Livraison.** Captures WebKit, sombre et clair, à 1180 et 820 px : la carte d'alignement, Mon matériel, une page
par section qui a perdu son titre, une page où le témoin a pris sa place.

**Réponses de Cowork aux questions de l'inventaire.**
1. Le témoin : une règle commune. Les titres devenant invisibles, il se pose en tête du contenu, à la place du
   titre ; s'il apparaît plus bas dans la page, il est ramené à l'écran, comme aux présences.
2. Les 18 phrases devenues fausses : reformulations de Claude Code, au plus près du texte actuel ; rien n'est
   remplacé avant l'accord de Grégoire.
3. Les cas ambigus : tels quels.
4. « dans Suivi du groupe » devient « dans Suivi › Groupe ».
5. La fenêtre d'aide « Données démo » : rattachée à « Explorer », à la première ouverture de la démo seulement.
6. Masquer les deux sortes de titres (identiques et formes longues), sauf « Rencontres (ortho.) ».
7. La bibliothèque des tampons de Modélisation reste une icône d'outil.
8. À Grégoire, en une seule liste : les 18 reformulations et toutes les lignes de description
   (`A-DECIDER-2026-11-07-lot-3-les-textes.md`).
Les trois infobulles que rien n'affiche : laissées, sans inscription.
