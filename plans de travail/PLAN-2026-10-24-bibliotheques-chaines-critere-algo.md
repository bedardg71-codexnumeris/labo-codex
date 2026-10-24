# Plan – Les bibliothèques en menu déroulant, les chaînes d'étapes, le critère algorithmique (24 octobre 2026)

> Écrit par Cowork le samedi 24 octobre 2026 à 12 h 15 (Toronto), sur `main` = `445e19d9`. Né de deux maquettes faites avec Grégoire ce matin :
> - la sélection au-dessus de la fiche : https://claude.ai/artifact/VXgfAqHD1Aose5nnF9rLbX (version « Menu déroulant ») ;
> - le critère algorithmique : https://claude.ai/artifact/6cBTUpiKXmqs21cDDaoVuX.
> Repérage des bibliothèques : `REPERAGE-2026-10-24-bibliotheques.md`.

## Les décisions de Grégoire (24 oct.)

- 12 h 04 : « Je préfère le menu déroulant plutôt que le carrousel. […] nous allons appliquer ceci pour toutes les bibliothèques. » Et : appliquer au critère algorithmique la présentation de la maquette.
- 12 h 10 : d'accord avec la proposition de Cowork (trois lots, tampons exclus, Carte d'alignement déjà conforme, Enseignant·e, Étudiant·es et Horaire inclus au lot du Cadre).
- 12 h 10 : « Je voudrais que l'on voie dans chaque partie la chaîne d'étapes requises pour avoir un outil fonctionnel (grille, échelle, etc.). » Une option dans les réglages de l'affichage de l'interface, « Afficher les chaînes d'étapes », **activée par défaut**.
- 12 h 10 : « Nous allons également retirer les badges à côté du menu déroulant afin de dégager et décharger l'espace. Misons sur la sobriété. »
- La bibliothèque reste une fenêtre (modal) : inchangée (Cowork, 12 h 00, sans objection).

## Les lots, dans l'ordre

| Lot | Ce que l'utilisateur voit | Fiche | État |
|---|---|---|---|
| 1. La Conception | Productions, Grilles, Échelles, Cartouches, Pratiques : « Consulter la bibliothèque », un menu déroulant de sa sélection, « + Nouvelle … » ; la fiche ouverte sur toute la largeur. Plus de barre latérale. | #1147 | **codé, relu, accepté avec une retouche** (`e3f42ec4` ; `VERDICT-RELECTURE-2026-10-24-bibliotheques-menu-conception.md`), non poussé ; composant `js/menu-selection.js` |
| 2. Le Cadre | Les six accordéons de la page Trimestre (Trimestre, Cours, Enseignant·e, Étudiant·es, Horaire, Groupe-cours) : la même rangée en tête, au lieu de la colonne de gauche. | #1148 | **consigne prête** : `CONSIGNE-LOT-2026-10-24-bibliotheques-menu-cadre.md` (avec la Carte d'alignement et le dernier « Gérez ») |
| 3. Les chaînes d'étapes | Dans chaque partie, la chaîne des étapes qui rendent l'outil fonctionnel, sur le modèle de la barre du Trimestre (un composant commun, tiré de `.barre-convergence`). Une option « Afficher les chaînes d'étapes » dans les réglages de l'affichage, activée par défaut. Absorbe #1146. | #1149 | à cadrer ; **revient à Grégoire** : les étapes de chaque outil et leurs mots (Cowork les propose à corriger) |
| 4. Le critère algorithmique | La présentation de la maquette : la chaîne en haut, la palette qui dit à quoi elle sert, les zones où se posent les blocs (en violet), ce que l'élève lira à droite ; blocs à bordure égale sur les quatre côtés (retouche de Grégoire, 11 h 22). | #1150 | à cadrer ; s'insère dans `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`, avant l'étape 3 (la table de cas) |

**Pourquoi cet ordre** : le lot 4 a trois colonnes et a besoin de la largeur que le lot 1 libère ; le lot 2 réemploie le composant du lot 1 ; le lot 3 pose ses chaînes sur des écrans déjà stabilisés.

## Hors du plan

- Les tampons d'Annoter : exclus (la palette est l'outil d'annotation lui-même ; un menu ajouterait un geste à chaque tampon).
- La Carte d'alignement : même modèle (bouton « Consulter la bibliothèque » et menu `#planif-liste-cartes`), **apparence différente, mesurée au lot 1** (pas de bande bleu pâle, menu de hauteur native sur le Mac, « Actions ▾ » au lieu de « + Nouvelle … ») : à aligner au lot 2, l'apparence seulement.
- La fenêtre de la bibliothèque : déjà commune aux dix bibliothèques (`BibliothequeUI.creerModal`), inchangée.
