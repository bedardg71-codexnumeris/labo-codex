# Rapport — lot 4 « Les pages sans emboîtement », étape 2 (7 nov. 2026)

Écrit par Claude Code. Branche `lot/en-tete-epure`. Inventaire approuvé et décisions reçues :
`INVENTAIRE-2026-11-07-pages-sans-emboitement.md` (§ 6).

## Ce qui est livré

| Commit | Contenu |
|---|---|
| `fe0d2b54c`, `056275301` | Évaluation › Préparer, page modèle (esquisse 68) ; la pastille pleine réservée aux étapes à faire |
| `33ff3840f` | La règle commune : plus de panneau autour du contenu, sur les 39 pages |
| `6ad15e114` | Plus de carte dans une carte sur les 19 autres pages de l'inventaire (§ 2) |
| `a96989682`, et le commit du test #1013 | Deux tests laissés en retard par le lot 3 (la pastille des Nouveautés, le libellé court « Préparer ») |

Aucun texte ni comportement ne change. Couleurs retouchées pour tenir 4,5:1 sur le fond de la page, en clair
seulement : le texte discret (#666677 → #636374), le texte des alertes « attention » (#7a5a20 → #765720), les deux
boutons « Guide » de Pratiques (blancs sur la page, désormais sombres hors d'un en-tête bleu marine).

## Comment c'est vérifié

`tests/integration/pages-sans-emboitement-2026-11-07.spec.js`, WebKit, sombre et clair :

- Préparer : aucun cadre entre la zone de dépôt et la page, la zone sur toute la largeur, pointillés gardés, les
  chiffres de l'explication sans disque.
- Les 39 pages : aucun panneau (conteneur, contenu, section) ; tout texte posé sur le fond de la page à 4,5:1 au moins.
- Les 19 pages de l'inventaire, accordéons ouverts et une fiche ouverte en Conception : jamais de carte dans une carte,
  hors des cadres à fonction nommés dans le banc.

Chaque test échoue sur le code d'avant (break-test fait : il nomme les cadres retirés). Vitest : 10 767 verts, 1 rouge
étranger au lot (voir plus bas). 43 bancs Playwright voisins : verts après la mise à jour du test #1013.

Captures avant et après, sombre et clair, 1180 et 820 px :
`Claude outputs/captures-2026-11-07-pages-sans-emboitement/` (Préparer, puis une page par section).

## Ce que j'ai décidé seul

- **Conception** (Grilles, Échelles) : de « le fond du formulaire ou les cadres des critères », c'est le formulaire
  qui part. Un critère, un niveau restent l'unique carte : ce sont eux qui regroupent des champs qui vont ensemble.
- **Le compteur des présences** perd son fond à l'état normal ; son fond jaune de l'état « message » (pas de cours ce
  jour-là) reste, parce qu'il signale.
- **Les bandes à filet** (la bande « support humain » de l'accueil, « Outil en développement ») gardent leur filet
  de couleur à gauche et perdent leur fond.
- **Sous 1024 px**, le conteneur prend toute la largeur : à 95 % sans marge auto, le contenu collait à gauche
  (21 px contre 63 px à 820), ce qui se voyait une fois le panneau parti.

## Trouvailles et leur disposition

1. **La pastille de « 1 Sélection des fichiers » en sombre** : chiffre blanc sur bleu clair, 2,56:1. Antérieure au lot,
   sur le fond propre de la pastille. *Inscrite ici* ; aucun symptôme vécu, donc pas au BACKLOG.
2. **Aide › Référence** porte six petits fonds bleu pâle écrits dans la page. L'inventaire mesure l'Aide conforme (sous
   le seuil de 160 × 40 px ou accordéons fermés) : *non touchés*, hors de la liste approuvée.
3. **Annoter avec une copie** n'est pas mesurée : la démo n'en livre aucune (inventaire § 4). *Reste à faire* au
   prochain passage sur Annoter.
4. **La sentinelle du logo** (`sentinelle-en-tete-epure-2026-11-07`, favicon et icône d'accueil) est rouge : des
   fichiers de `Logo/` sont modifiés dans l'arbre de travail, hors de cette session. *Non touchés.*
