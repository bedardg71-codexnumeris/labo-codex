# Verdict de relecture – Les palettes d'Annoter et d'Évaluer, une même famille

> Cowork, lundi 2 novembre 2026, 14 h 50 (Toronto, mesuré par `date`). Relu : `4e2ce227`, `14103b77`, `63a127a8`, `2ee828ab` (diffs de `js/`, des sentinelles et la liste des specs touchées), `RAPPORT-2026-11-02-palettes-une-famille.md`.

## Verdict : accepté, sans retouche

- § 1 : ↔ et ↕ ne restent dans aucun en-tête ; seule la tuile « Double » des Extrémités porte encore ↔ (sentinelle des flèches ajustée en conséquence). La disposition en bandeau part avec son essai (`palette-layout-h-hauteur-774.spec.js` supprimé) : zéro dette. Le stock suit la décision de Cowork : une clé neuve `<id>-geometrie`, l'ancienne `<id>-pos` n'est plus lue et n'est pas effacée ; `'h'` se lit comme l'étendue.
- § 2 : rangée du bas collante, au-dessus de la poignée ; tuiles à 45 px de large au plus étroit, au-dessus de 44. Hors plein écran à 1180 × 820, l'étendue défile (392 sur 603) avec « Annuler » visible : conséquence annoncée à Grégoire le matin même (la palette Codes ne tient plus dessous).
- § 3 : le nom du tampon touché passe par `textContent`, essai à l'appui ; aucun nom coupé parmi les tampons par défaut (5 avant).
- § 4 : `poserBoutonVerrou` et `btnVerrouPalette` disparaissent du code et d'`index.html` (sentinelle 489 réécrite pour le vérifier) ; les mots sont ceux validés par Grégoire.
- Sentinelle 467 (`innerHTML`) : 74 → 76, deux constantes de l'application (icônes), sans désescape ; acceptable.
- Pas de `console.log`, pas de handler inline ajoutés. Le bloc de jetons d'`index.html` suit chaque commit qui touche `js/`.

## Deux suppositions de Claude Code retenues telles quelles

- Le compte de Codes devient une pastille (« 23 »), les mots dans sa bulle.
- Les libellés de Paramètres (élève, production) passent à la ligne au lieu de l'ellipse : c'est la lettre de la consigne de Cowork (« aucun nom coupé, dans toute la famille »).

## Trouvaille à trancher par Cowork

- `origin/lot/pauses-apres-ouverture`, non fusionnée : elle se fusionne avec la prochaine mise en ligne, comme prévu le 1er nov. (décision de Cowork).
