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
| 1. La Conception | Productions, Grilles, Échelles, Cartouches, Pratiques : « Consulter la bibliothèque », un menu déroulant de sa sélection, « + Nouvelle … » ; la fiche ouverte sur toute la largeur. Plus de barre latérale. | #1147 | **codé, relu, accepté avec une retouche** (`e3f42ec4` ; `VERDICT-RELECTURE-2026-10-24-bibliotheques-menu-conception.md`), **en ligne en 1.217.0** (`973ad366`) ; composant `js/menu-selection.js` |
| 2. Le Cadre | Les six accordéons de la page Trimestre (Trimestre, Cours, Enseignant·e, Étudiant·es, Horaire, Groupe-cours) : la même rangée en tête, au lieu de la colonne de gauche. | #1148 | **codé, relu, accepté avec une retouche** (`27056905` ; `VERDICT-RELECTURE-2026-10-24-bibliotheques-menu-cadre.md` : la bande de la Carte d'alignement sur le couple seul — retouche faite), non poussé |
| 2 bis. Le profil individuel | Suivi › Profils individuels : la barre latérale remplacée par une bande à deux lignes : « Liste des étudiant·es », ‹ le menu de l'élève ›, ses étiquettes ; puis les sections en boutons. La section sur toute la largeur. Demande et maquette validée de Grégoire, 24 oct. 17 h 41 (https://claude.ai/artifact/VB2a6v7wB3yPXgg2rDfopp). | #1151 | **codé, relu, accepté avec une retouche** (`3a836f6c` ; `VERDICT-RELECTURE-2026-10-24-profil-individuel-rangee.md` : le titre de la section rendu au lecteur d'écran — retouche faite), non poussé |
| 3. Les chaînes d'étapes | Dans chaque partie, la chaîne des étapes qui rendent l'outil fonctionnel, sur le modèle de la barre du Trimestre (un composant commun, tiré de `.barre-convergence`). Une option « Afficher les chaînes d'étapes » dans les réglages de l'affichage, activée par défaut. Absorbe #1146. | #1149 | **3a codé, relu, accepté** (`914a0d31` ; `VERDICT-RELECTURE-2026-10-24-chaines-etapes-3a.md` ; la ligne d'aide gardée par Grégoire à 19 h 41), non poussé ; consigne `CONSIGNE-LOT-2026-10-24-chaines-etapes-3a.md` : le composant commun, l'option (Préférences › Expérience visuelle, cochée par défaut, qui masque aussi la barre du Trimestre), la chaîne des grilles (Critères, Pondération, Production ; validée par Grégoire le 24 oct. à 19 h 04). **3b** : échelles, cartouches, productions, pratiques ; les quatre chaînes validées par Grégoire de 19 h 44 à 19 h 52 (`CHAINES-ETAPES-3b-etapes-validees.md`) ; consigne `CONSIGNE-LOT-2026-10-24-chaines-etapes-3b.md` ; **3b codé, relu, accepté** (`998e73c1` ; `VERDICT-RELECTURE-2026-10-24-chaines-etapes-3b.md`), non poussé ; #1149 cochée |
| 4. Le critère algorithmique | La présentation de la maquette : la chaîne en haut, la palette qui dit à quoi elle sert, les zones où se posent les blocs (en violet), ce que l'élève lira à droite ; blocs à bordure égale sur les quatre côtés (retouche de Grégoire, 11 h 22). | #1150 | **codé** (24 oct., Claude Code) sur la consigne `CONSIGNE-LOT-2026-10-24-critere-algorithmique-presentation.md` et la maquette `MAQUETTE-2026-10-24-critere-algorithmique.html` ; en relecture : `DEMANDE-RELECTURE-2026-10-24-critere-algorithmique-presentation.md`, non poussé ; ordre de Grégoire (21 h 43) : ce lot, puis les bibliothèques en deux colonnes, puis la table de cas |

**Pourquoi cet ordre** : le lot 4 a trois colonnes et a besoin de la largeur que le lot 1 libère ; le lot 2 réemploie le composant du lot 1 ; le lot 3 pose ses chaînes sur des écrans déjà stabilisés.

## Inséré le 24 oct. à 20 h 55 (bug, priorité)

- **« + Nouvelle cartouche » renomme la cartouche ouverte ; changer la grille d'une cartouche la dédouble** : trouvé au lot 3b, probable source du mécanisme (1) de #1144. Décision de Grégoire : « on corrige ». Consigne : `CONSIGNE-LOT-2026-10-24-cartouche-nouvelle-renomme.md`. Passe avant le lot 4. **#1153, codé, en relecture** (`DEMANDE-RELECTURE-2026-10-24-cartouche-nouvelle-renomme.md`), non poussé.

## Hors du plan

- Les tampons d'Annoter : exclus (la palette est l'outil d'annotation lui-même ; un menu ajouterait un geste à chaque tampon).
- La Carte d'alignement : même modèle (bouton « Consulter la bibliothèque » et menu `#planif-liste-cartes`), **apparence différente, mesurée au lot 1** (pas de bande bleu pâle, menu de hauteur native sur le Mac, « Actions ▾ » au lieu de « + Nouvelle … ») : à aligner au lot 2, l'apparence seulement.
- La fenêtre de la bibliothèque : déjà commune aux dix bibliothèques (`BibliothequeUI.creerModal`), inchangée.
