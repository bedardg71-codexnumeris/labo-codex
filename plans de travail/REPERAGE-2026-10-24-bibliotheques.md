# Repérage — les bibliothèques de l'app et la place de « ta sélection » (24 octobre 2026)

**Demande de Grégoire** (24 oct., 11 h 39) : « Il y a plusieurs endroits dans l'application où il y a des bibliothèques. J'aimerais qu'on uniformise éventuellement la présentation partout. Pourrais-tu d'abord faire un repérage ? »

**Méthode** : mesuré au code par Cowork (`index.html`, `js/`), lecture seule. **Non vérifié à l'écran.** Suite de la maquette de la bande horizontale (https://claude.ai/artifact/VXgfAqHD1Aose5nnF9rLbX), qui remplace la barre latérale des grilles, échelles et cartouches.

## Ce qui est déjà commun

La fenêtre de la bibliothèque elle-même : les dix bibliothèques passent par le même composant (`BibliothequeUI.creerModal`, `js/bibliotheque-ui.js`). Ce qui diffère, c'est l'endroit où l'écran montre **ta sélection** (les objets que la bibliothèque a mis à portée de main) et le bouton qui ouvre la bibliothèque.

## Les endroits touchés

| Où | Bibliothèque de… | Ta sélection s'affiche dans… | Le bouton |
|---|---|---|---|
| Conception › Productions étudiantes | productions | barre latérale (`layout-sidebar-2col`) | « Consulter la bibliothèque » |
| Conception › Grilles de critères | grilles | barre latérale | « Consulter la bibliothèque » |
| Conception › Échelles de performance | échelles | barre latérale | « Consulter la bibliothèque » |
| Conception › Cartouches de rétroaction | cartouches | barre latérale | « Consulter la bibliothèque » |
| Conception › Pratiques de notation | pratiques | barre latérale | « Consulter la bibliothèque » |
| Conception › Carte d'alignement | cartes | menu déroulant (`#planif-liste-cartes`) | « Consulter la bibliothèque » |
| Cadre › Trimestre › Trimestre | trimestres | colonne de gauche de l'accordéon (`disposition-bibliotheque-formulaire`) | « Bibliothèque » avec icône, bouton secondaire |
| Cadre › Trimestre › Cours | cours | colonne de gauche de l'accordéon | « Bibliothèque » avec icône |
| Cadre › Trimestre › Groupe-cours | groupes-cours | colonne de gauche de l'accordéon | « Bibliothèque » avec icône |
| Évaluation › Annoter (palette des tampons) | tampons | la palette elle-même | bouton à icône seule au bas de la palette |

## Voisins sans bibliothèque, même disposition

- Cadre › Trimestre › Enseignant·e, Étudiant·es, Horaire : la même colonne de gauche (menu déroulant + carte résumé), sans bibliothèque.
- CoP › Outils d'animation : une barre latérale (`sidebar-navigation`), sans bibliothèque.

## Trois présentations de la sélection, deux libellés de bouton

1. Barre latérale à gauche, fiche à droite (Conception, cinq écrans).
2. Colonne de gauche dans un accordéon (Cadre, trois écrans avec bibliothèque, trois sans).
3. Menu déroulant (Carte d'alignement) ; palette (tampons).

Libellés : « Consulter la bibliothèque » (bouton principal, Conception) ; « Bibliothèque » avec icône (bouton secondaire, Cadre) ; icône seule (tampons).

## Rien n'est décidé

Aucun cadrage : ce repérage sert à décider jusqu'où va l'uniformisation. Voisin : #1146 (les chaînes d'étapes, même esprit d'uniformisation).
