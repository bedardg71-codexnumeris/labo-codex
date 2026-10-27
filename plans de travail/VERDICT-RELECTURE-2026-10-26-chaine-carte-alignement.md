# Verdict de relecture – La chaîne d'étapes de la Carte d'alignement (#1172)

> Cowork, mardi 27 octobre 2026, 06 h 26 (Toronto, mesuré par `date`). Relu : `970a3b91` (16 fichiers : `js/planification-carte.js`, `styles.css`, `index.html`, deux specs, un test unitaire, les captures), la demande de relecture, et deux captures (garnie à 820 px en clair, à 1 440 px en sombre). `main` = `99ac1eaf` (le tri de Git fusionné par-dessus), non poussé.

## Verdict : accepté, sans retouche

La chaîne fait ce que la consigne demandait, dans les mots validés par Grégoire (21 h 14 à 21 h 16) : sept étapes de présence, aucun ordre prescrit, aucun jugement de l'alignement. `etapesChaineCarte` est pure et compte un clone une fois, avec sa source ; les objectifs vides ne comptent pas. La chaîne se redessine au seul point de passage des écritures (`sauvegarder`, Annuler et Rétablir compris) et au chargement, carte vide comprise. Le guide s'ouvre par l'`id` de sa page, jamais par un rang en dur. Aucune donnée d'utilisateur n'entre dans le HTML de la chaîne (libellés fixes et nombres) ; aucun gestionnaire en ligne, aucun `console.log`. La case « Afficher les chaînes d'étapes » la masque par le composant commun, et une spec le vérifie. Les captures sont lisibles en clair et en sombre ; les sept étapes tiennent sur une ligne à 820 px.

## Les points soumis

1. **Les 96 px pris au canevas : gardés (décision de Cowork).** La chaîne a la forme des autres chaînes, que Grégoire a voulues uniformes (24 oct.) ; une version resserrée pour la seule carte romprait cette unité. Qui veut tout le canevas a déjà la case des Préférences. À observer en usage, sur la vraie carte de Grégoire : s'il trouve le canevas trop court, on y revient.
2. **Les deux corrections hors consigne : acceptées.** Le guide qui couvrait la chaîne, et le guide caché sous le plein écran, rendaient sans effet le clic que le lot livre : c'est le lot qui n'était pas fini, pas une trouvaille. La seconde répare aussi le bouton « Guide » en plein écran.
3. **La spec de la loupe recalée : acceptée.** Elle fait défiler jusqu'à la carte, comme l'utilisateur ; ce qu'elle vérifie n'a pas changé.
4. **Coder malgré les fichiers non commités de Cowork : accepté.** C'étaient des documents de Cowork, sans fichier commun avec le lot. Les prochaines consignes diront « sans changement non commité d'une autre session, hors des documents de Cowork ». La charge due à la session `tri-git`, ouverte en parallèle à 21 h 30, est assumée par Cowork : l'essai qui a dépassé son délai, vert rejoué seul, sera rejugé par la vérification complète du soir.
5. **Le bloc qui demande deux « Annuler » : refusé pour le BACKLOG** (aucun symptôme vécu par Grégoire, règle du 24 août), noté ici. S'il le rencontre, il entre.
6. **Portes terrain : aucune due**, d'accord : le lot n'écrit rien. Safari réel, l'iPad et la vraie carte de Grégoire sont à observer en usage.

## La suite

Rien à faire avant la mise en ligne. #1172 part ce soir avec le tri de Git, après la vérification complète, au signal de Grégoire ; ses Nouvelles lui reviennent.
