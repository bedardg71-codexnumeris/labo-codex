# Textes – des mémos dans le canevas de la carte d'alignement (28 novembre 2026)

> Lot « mémos du canevas », branche `claude/memos-canevas-r21btn` (rapport : `RAPPORT-2026-11-28-memos-canevas.md`).
> **Statut des mots** : posés par la session comme mots de travail, puis acceptés (voir plus bas). Un mot corrigé se corrige
> ICI et à sa source (nommée à chaque repère).
> **Relu par** `tests/unit/sentinelle-memos-canevas.test.js` : chaque ligne `> …` d'une section est un texte posé tel quel,
> et le banc rougit si la source dit autre chose que ce fichier.
> Neuf des douze textes des mémos vivent au même endroit : l'objet `TEXTES` en tête de `js/planification-memos.js`. Les trois
> autres (M1, M2, M3) sont dans `index.html`. **M1 à M12 : acceptés tels quels par Grégoire (amendement du 28 nov., 10 h 25).**
> M13 à M15 viennent de cet amendement (la corbeille, et le bouton de la palette compacte).
> Aucun de ces mots n'est lu par un élève : ils ne paraissent que sur le canevas de l'enseignant.

## M1 · index.html · le nom dans la palette « Nœuds », sous le filet, à l'écart des blocs

> Mémo

## M2 · index.html · l'infobulle du bouton « Mémo » de la palette

> Poser un mémo sur le canevas : un espace libre pour écrire ou coller, qui ne fait pas partie de la carte

## M3 · index.html · le bouton de la barre d'outils qui masque ou montre tous les mémos

> Mémos

## M4 · js/planification-memos.js (`TEXTES.masquer`) · l'infobulle de ce bouton quand les mémos sont affichés

> Masquer les mémos

## M5 · js/planification-memos.js (`TEXTES.afficher`) · l'infobulle de ce bouton quand les mémos sont masqués

> Afficher les mémos

## M6 · js/planification-memos.js (`TEXTES.vide`) · le texte gris d'un mémo vide

> Écris ou colle ici…

## M7 · js/planification-memos.js (`TEXTES.barre`) · l'infobulle de la barre du haut d'un mémo

> Glisser pour déplacer le mémo

## M8 · js/planification-memos.js (`TEXTES.supprimer`) · l'infobulle du × d'un mémo

> Supprimer ce mémo

## M9 · js/planification-memos.js (`TEXTES.poignee`) · l'infobulle du coin en bas à droite d'un mémo

> Glisser pour agrandir ou réduire le mémo

## M10 · js/planification-memos.js (`TEXTES.supprime`) · le message qui suit une suppression (par le × ou par la corbeille)

> Mémo supprimé — le bouton Annuler le ramène.

Calqué sur le message d'un bloc supprimé à la corbeille (« « … » supprimé — le bouton Annuler le ramène. »), tiret compris.

## M11 · js/planification-memos.js (`TEXTES.tronque`) · le message quand un texte collé dépasse 50 000 caractères

> Ce texte dépasse ce qu'un mémo peut garder : la fin a été coupée.

## M12 · js/planification-memos.js (`TEXTES.etiquetteTexte`) · le nom du champ pour un lecteur d'écran (jamais affiché)

> Texte du mémo

## M13 · index.html · l'infobulle de la corbeille du canevas (DEMANDÉE par l'amendement de 10 h 25), puis son nom pour un lecteur d'écran

> Glisse un bloc ou un mémo ici pour le supprimer
> Corbeille — glisse un bloc ou un mémo ici pour le supprimer

La seconde ligne n'est jamais affichée ; elle suit la première, mot pour mot, derrière « Corbeille — » qui y était déjà.

## M14 · index.html et js/planification-carte.js (`appliquerVersionPaletteNoeuds`) · l'infobulle du bouton de l'en-tête de la palette « Nœuds », version étendue affichée

> Passer à la version compacte

## M15 · js/planification-carte.js (`appliquerVersionPaletteNoeuds`) · la même infobulle, version compacte affichée

> Passer à la version étendue

M14 et M15 ne sont PAS des mots neufs : ce sont, lettre pour lettre, ceux du même bouton sur les palettes d'« Annoter et
évaluer » (`js/travaux-outils.js`, `_texteBoutonVersion`). Le bouton n'a pas de texte affiché, seulement une icône, la même.

## Ce qui n'a PAS de mot neuf

- La corbeille garde son libellé visible (« Déposer ici pour supprimer »).
- « Annuler » et « Rétablir » de la barre d'outils : inchangés.
- Les dix-huit noms de nœuds et les six titres de famille de la palette : inchangés dans la version compacte, aucun abrégé.
