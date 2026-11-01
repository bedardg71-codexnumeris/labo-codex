# Consigne – La palette Évaluation n'a qu'une barre de défilement (1er novembre 2026)

> Écrite par Cowork le dimanche 1er novembre 2026 à 5 h 57 (Toronto, mesuré par `date`), sur `main` = `origin/main` = `0fd0427f` (1.229.0 en ligne).
> **Retour de Grégoire** (iPad, Safari, 1.229.0, capture de 5 h 44, mode Évaluer) : dans la palette Évaluation (ses critères à échelle de performance et le critère algorithmique « Français écrit »), un double défilement rend l'affichage et le défilement difficiles. Retour testeur : inscris-le au `SUIVI-BUGS.md`, aux ouverts, au prochain numéro libre. La capture porte des noms réels : ne la recopie nulle part, ne cite aucun nom (règle 6 de `CLAUDE.md`).
> **Ordre du groupe du 1er nov.** (décision de Cowork) : après « la palette relit la grille », avant « la barre d'outils compacte ». Une seule session écrit à la fois ; `styles.css` est commun aux trois lots.

## 0. Avant tout

- Commit de docs seul : cette consigne.

## 1. La cause, lue par Cowork dans `styles.css` (non mesurée : remesure-la)

Trois éléments imbriqués peuvent défiler dans la palette Évaluation (`#travaux-palette-eval-droite`, créée par `creerPaletteEval`, `js/travaux-ui.js` vers 5467, qui déplace le panneau existant dans `.palette-flottante-contenu`) :

1. `.palette-flottante` (vers 20250) : `overflow: auto`. La palette défile.
2. `.travaux-palette-eval .palette-flottante-contenu` (vers 17468) : `max-height: calc(100vh - 200px)` et `overflow-x: hidden`, ce qui fait calculer `overflow-y` à `auto`. Le contenu défile aussi. (Une hauteur posée en ligne lève le plafond : `.palette-flottante[style*="height"] .palette-flottante-contenu`, vers 20671.)
3. `.travaux-palette-eval .travaux-panneau-corps` (vers 17477) : `overflow-y: auto`. Un troisième.

**La palette Rétroaction a déjà la bonne recette** (`#travaux-palette-eval-retro`, vers 17794-17830) : palette en colonne flex, contenu `flex: 1; overflow-y: auto; min-height: 0`.

**Mesure d'abord**, dans WebKit à 1180 × 820, dans la disposition de la capture (palette sur toute la hauteur), puis après ↔ et après ↕ : quels ancêtres ont `scrollHeight > clientHeight` avec un `overflow-y` qui défile. Écris-le au rapport.

## 2. Le correctif (décision technique de Cowork)

- **Un seul élément défile dans la palette Évaluation : son contenu.** La palette elle-même ne défile plus, et sa barre de titre reste visible ; le corps du panneau prend sa hauteur et ne défile plus.
- Bâtis sur la recette de la Rétroaction. Si la mesure le permet, les deux palettes `.travaux-palette-eval` partagent une seule règle (zéro dette : pas deux recettes côte à côte).
- `overscroll-behavior: contain` sur l'élément qui défile, pour que le geste ne passe pas à la page sur l'iPad.
- Ne touche pas au `.palette-flottante` générique (Codes, Tampons, Annotation). Regarde la palette Paramètres (même famille ?) et dis ce que tu as vu ; corrige-la seulement si elle a le même défaut.
- Repliée (−), en ↔ et en ↕ : un seul élément défile aussi ; la poignée de redimensionnement (#773) reste atteignable.
- Source ou stock : affichage seulement, pas de stock. Écris-le au rapport.

## 3. Le test

- Playwright, projet `webkit`, fenêtre 1180 × 820, mode Évaluer, une grille de démo avec plusieurs critères dont un algorithmique : dans la palette Évaluation, **exactement un** élément défile ; après un défilement jusqu'en bas, la barre de titre est visible et le dernier critère aussi.
- Contre-épreuve : remettre `overflow-y: auto` sur le corps du panneau fait rougir le test (skill `verification-adverse`).

## 4. Fin

Commit, rapport `plans de travail/RAPPORT-2026-11-01-palette-evaluation-un-defilement.md` à Cowork pour relecture. **Pas de push** : la mise en ligne suit la cadence du soir. `SUIVI-BUGS.md` : aux corrigés, « codé, pas en ligne ».

Geste à vérifier sur l'iPad après la mise en ligne : dans Évaluer, faire défiler d'un doigt la palette Évaluation jusqu'au critère algorithmique, en un seul mouvement, avec une seule barre de défilement.
