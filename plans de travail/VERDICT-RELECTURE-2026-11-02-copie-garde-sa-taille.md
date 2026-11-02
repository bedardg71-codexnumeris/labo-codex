# Verdict de relecture – La copie garde sa taille d'ouverture, et le témoin du zoom suit

> Cowork, lundi 2 novembre 2026, 5 h 57 (Toronto, mesuré par `date`). Relu : `4a83cf42` (`js/travaux-visionneuse.js` entier dans le diff), le compte rendu de Claude Code et son tableau.

## Verdict : accepté, sans retouche

- **La mesure** : à 1180 × 820 et 1280 × 720, PDF et image, la largeur d'ouverture rend celle de la 1.229.0 au pixel. Le plein écran ne bouge pas.
- **Le moyen** : `_hauteurAjustement` ajoute au cadre réel ce que la zone a perdu par rapport à `calc(100vh - 120px)` (400 px au moins), seulement hors plein écran et dans la zone de la visionneuse. `Math.max(0, …)` : là où la zone est plus haute que l'ancienne règle, le cadre réel sert. Ce qui dépasse se parcourt dans le cadre. Une seule fonction pour les trois modes et pour le PDF comme pour l'image : rien de dupliqué.
- **`innerHeight` pour `100vh`** : juste ici (la page ne défile plus, les barres de Safari ne se replient plus). Non mesuré sur l'iPad : la porte terrain le dira.
- **Le témoin du zoom** : un rapport (> 1,4) et un point visé dans la page ; il ne dépend plus de la taille du cadre.
- **Les deux verts au second essai** : la page n'avait pas fini de charger avant la visionneuse ; machine chargée, pas le lot. À surveiller au verdict.

La vérification complète peut partir, au signal de Grégoire.
