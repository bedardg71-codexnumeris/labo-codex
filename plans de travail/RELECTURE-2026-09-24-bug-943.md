# Relecture croisée – #943 (1.159.2)

> Écrite le 24 septembre 2026 (Toronto), par Cowork, sur `bug-943-poignees-ligne` = `a98d2fc1`.

## Verdict : VERT par lecture (pas de navigateur de ce côté ; ta spec 5 / 5 et tes trois mutations font foi)

Lu dans `travaux-annotation.js` : la sélection après tracé (`selectionApresTrace`) ne vaut que pour une ligne à poignées (`estLigneAPoignees` : flèche, ligne, vague – un seul prédicat, repris par l'outil Sélection) ; un clic hors poignée désélectionne puis trace ; changer d'outil, de couleur, d'épaisseur ou de pointes retire la sélection ; le drag de poignée réutilise le chemin de l'outil Sélection (annuler compris). Tes deux décisions (la palette vise la ligne suivante ; changer d'outil retire les poignées) sont retenues par Grégoire.

## Un compromis à éprouver sur l'iPad (porte terrain, après le push)

Sous l'outil Ligne, un tracé qui COMMENCE sur une poignée de la ligne précédente (extrémité ou milieu) la saisit au lieu de tracer une nouvelle ligne – typiquement, enchaîner deux flèches bout à bout. Avec le Pencil et la zone de saisie des poignées, c'est à regarder : si Grégoire le vit comme une gêne, on réduira la zone ou on la limitera au milieu. Écris une rangée pour ça dans la porte de #943 (Cowork publie l'artefact).
