# Textes validés – Le réglage de l'axe des barres de l'Aperçu

> Cowork, samedi 31 octobre 2026. Les sept textes soumis par `RAPPORT-2026-10-30-barres-apercu.md` (« Les mots à valider par Grégoire ») et `RAPPORT-2026-10-30-orange-brule-et-passage-symetrique.md` (le mot de l'aide). Validés un par un par Grégoire ; ce fichier se complète à chaque réponse.

| # | Où | Texte | Décision |
|---|---|---|---|
| 1 | Intertitre du réglage | « Axe des barres de l'Aperçu » | Gardé tel quel (7 h 20) |
| 2 | Étiquette d'effet | « Aperçu › barres Assiduité et Complétion » | Gardé tel quel (7 h 21) |
| 3 | Présentation | « Choisis comment les barres Assiduité et Complétion répartissent leur largeur. La barre Performance reste proportionnelle. Ce choix ne touche que l'affichage : aucun seuil ni aucun calcul ne change. » | Retouchée par Cowork, acceptée (7 h 22). Proposé : « Comment les barres… répartissent leur largeur. […] Ce choix ne change ni les seuils, ni les couleurs, ni aucun calcul. » |
| 4 | Premier choix | « Proportionnel (par défaut) » – « Chaque point de pourcentage a la même largeur, de 30 à 100 %. Les écarts se comparent à l'œil, mais quand presque tout le groupe dépasse tes seuils, il se tasse à droite de la barre. » | Seconde phrase retouchée par Cowork, acceptée (7 h 23). Proposé : « Les distances se comparent à l'œil, mais un groupe régulier se tasse à droite. » |
| 5 | Second choix | « Deux segments » – « De 30 % à ton seuil le plus bas, l'axe tient dans le premier quart de la barre ; de ce seuil à 100 %, dans les trois autres. Quand presque tout le groupe dépasse tes seuils, il s'étale sur la barre, mais les écarts ne se comparent plus d'un segment à l'autre. » | Seconde phrase retouchée par Cowork, acceptée (7 h 23). Proposé : « Un groupe régulier s'étale, mais les distances de part et d'autre du seuil ne se comparent plus. » |
| 6 | Info-bulle de la graduation du seuil | « Ton seuil le plus bas : l'axe passe ici au second segment » | Retouchée par Cowork, acceptée (7 h 24). Proposé : « L'axe change d'échelle à ce seuil » |
| 7 | Info-bulle `depist-seuil-fragile` (Aide du seuil) | « … Dans la liste des étudiant·es, un chiffre sous ce seuil est orange brûlé. » | Gardée telle quelle (7 h 25) |

Les sept textes sont tranchés. Aucun ne parle aux élèves : tous sont lus par l'enseignant·e dans les réglages.

## Pour Claude Code

1. Appliquer les quatre retouches (textes 3, 4, 5 et 6), au caractère près, là où le lot des barres (`262c18bd`) les a posés. Les textes 1, 2 et 7 sont déjà dans le code : rien à faire.
2. Tout test ou sentinelle qui fige l'ancienne formulation suit la nouvelle ; aucun autre texte ne bouge.
3. Commit seul, sans release ni push : il part avec les autres après la vérification complète du soir. Relecture de Cowork ensuite.

## Relecture de Cowork (`55909e45`)

**Accepté.** Diff relu : les textes 3 à 6 sont au caractère près ceux de la table (`index.html`, `js/tableau-bord-apercu.js`) ; l'insécable avant le deux-points est bien là (`&nbsp;` et U+00A0) ; l'apostrophe courbe du texte 6 suit l'info-bulle remplacée. Aucune trace de l'ancienne formulation dans `js/`, `index.html`, `design-system.html` ni `tests/`. Le jeton de `tableau-bord-apercu.js` a suivi (`20261030r`). Rien exécuté.

Pour Claude Code : commiter ce fichier seul, pour que la référence du commit `55909e45` tienne. Pas de push avant la vérification complète du soir.

