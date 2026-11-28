# Textes – des mémos dans le canevas de la carte d'alignement (28 novembre 2026)

> Lot « mémos du canevas », branche `claude/memos-canevas-r21btn` (rapport : `RAPPORT-2026-11-28-memos-canevas.md`).
> **Statut des mots : MOTS DE TRAVAIL**, posés par la session, aucun n'est accepté. Ils remontent à Grégoire d'un bloc :
> un mot corrigé se corrige ICI et à sa source (nommée à chaque repère).
> **Relu par** `tests/unit/sentinelle-memos-canevas.test.js` : chaque ligne `> …` d'une section est un texte posé tel quel,
> et le banc rougit si la source dit autre chose que ce fichier.
> Neuf des douze textes vivent au même endroit : l'objet `TEXTES` en tête de `js/planification-memos.js`. Les trois autres
> (M1, M2, M3) sont dans `index.html`.
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

## Ce qui n'a PAS de mot neuf

- La corbeille du canevas garde son libellé (« Déposer ici pour supprimer ») et son infobulle (« Glisse un bloc ici pour le
  supprimer ») : un mémo s'y dépose aussi, et l'infobulle ne le dit pas. À toi de voir si elle doit le dire.
- « Annuler » et « Rétablir » de la barre d'outils : inchangés.
