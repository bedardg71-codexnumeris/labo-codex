# Consigne — #1125, geste 2 du barème : une grille à niveaux nommés et à points se lit juste

> Écrite par Claude Code le jeudi 22 octobre 2026, sur mandat de Cowork (« la suite, sans Grégoire »),
> à partir de la fiche #1125 (`BACKLOG.md`) et du geste 2 de `PLAN-2026-10-19-bareme.md`.
> Symptôme vécu par Grégoire le 20 oct. (13 h 56), « Journal de lecture » : les points des tranches au
> bout du texte, le champ Points vide, d'où les « à compléter ».

## Ce qui change

Dans « Apporter mon matériel », une grille **créée en points** qui **nomme ses niveaux** écrit
directement un `bareme` sur chaque critère, au lieu de l'ancien `descripteurs.parNiveau` :

- une tranche par niveau qui porte un texte ou des points ;
- `nom` : le nom du niveau, tel qu'étiqueté ;
- `pointsMin` / `pointsMax` : les nombres lus dans les morceaux « Points » de la case (`cell.pts`),
  plusieurs morceaux réunis en une seule plage (de la plus petite à la plus grande valeur) ; aucun
  morceau « Points » → `null` (« à compléter », rien d'inventé) ;
- `texte` : le ou les descripteurs **seuls**, sans la ligne des points ;
- `id` : `ctx.id('TR_')`, comme une tranche ajoutée dans l'éditeur (`grilles.js`, `genererIdUnique('TR_')`).

## Ce qui ne change pas

- **Une grille sans niveaux** (`parCle`) garde ses réponses sous des clés de points : `bareme.lireCle`
  les lit déjà juste (fiche : « là la conversion marche »). Aucun symptôme ⮕ commentaire dans le code.
- **Une grille créée en niveaux** (« les deux », choix « niveaux ») : ses descripteurs vont dans
  l'échelle ; la ligne des points y reste telle qu'écrite.
- Aucun texte neuf : l'écran de confirmation ne dit pas encore « barème » (pièce 6 du plan, textes à
  valider par Grégoire). « Aller plus loin » compte un barème comme une grille qui décrit ses niveaux.
- Aucune note, aucun calcul : le barème n'entre dans aucun calcul (invariant 1).

## Tarir n'est pas réparer

Le correctif **tarit la source**. Le stock (la grille « Journal de lecture » déjà créée de Grégoire)
garde ses points dans le texte ; il se corrige à la main dans Grilles de critères (le champ Points
accepte « 3-4 »). Aucun geste de réparation proposé dans ce lot.

## Les bancs

- Unitaires : la dissection 2a (`M.a`, `M.c`), l'étape 5b (`C.b`), la grille neuve du barème : réécrits
  à la forme `bareme` ; un test neuf sur l'exemple Journal de lecture (points en nombre et en
  intervalle, « Insuffisant » à compléter, texte sans points) ; un test que plusieurs morceaux Points
  d'une case se réunissent ; `resumer` : `descr` vrai avec un barème.
- WebKit : `bareme-1.spec.js` (le stock d'avant se fabrique au banc, puisque la dissection n'en écrit
  plus) ; `materiel-dissection-2a.spec.js` si elle lit `parNiveau`.
- Break-test : remettre la ligne des points dans le texte → le test neuf rougit.

## Fin de lot

Un commit sur `main`, non poussé ; Vitest complet ; specs WebKit ciblées ; une demande de relecture courte.
