# Verdict de relecture – La palette Évaluation n'a qu'un défilement (#1214)

> Cowork, dimanche 1er novembre 2026, 7 h 36 (Toronto). Relu : `5eefed7c` (le diff de `styles.css`) et `RAPPORT-2026-11-01-palette-evaluation-un-defilement.md`.

## Verdict : accepté, sans retouche

- La mesure corrige la consigne : cinq éléments pouvaient défiler, pas trois, et le plafond de 750 px de la liste tronquait les critères (l'algorithmique montrait 63 px sur 287). Erreur de Cowork (cause lue, pas mesurée), corrigée par la mesure.
- Une seule règle pour les trois palettes d'Évaluer (`.palette-flottante.travaux-palette-eval`), `overscroll-behavior: contain` sur le contenu : conforme à la consigne. Paramètres avait le même défaut : son inclusion était prévue (« corrige-la seulement si elle a le même défaut »).
- Contre-épreuves : sept mutations, sept rouges, fichier restauré après chacune. La commande bloquée de 6 h 27 était un `cat` parasite, sans mutation appliquée ; vérifié par Cowork à 7 h 20 (le diff portait le correctif complet).
- L'inférence du rapport est juste à retenir : le « double défilement » vécu peut être le couple palette et page (la page défile hors plein écran). Le correctif empêche le geste de passer de la palette à la page ; la page, elle, défile toujours (trouvaille 4).

## Les trouvailles et leur issue (décisions de Cowork)

1. **La largeur des palettes d'Évaluer** (restent à 200 px, ↔ s'arrête à 320 px), 2. **le badge « ALGORITHMIQUE » coupé à 200 px**, 3. **les champs Erreurs et Mots clairs sur texte clair en mode sombre** : **corriger dans le lot de la palette Évaluation compacte**, qui touche les mêmes règles. Ajoutés à sa consigne.
4. **La page défile hors plein écran** (la zone finit à 1060 px pour un écran de 820) : **corriger dans le lot de la barre d'outils**, dont le but est de rendre l'espace à la copie. Ajouté à sa consigne.
5. **Une palette glissée vers le bas dépasse sa zone** (lu, pas mesuré, existait déjà) : **inscrire et continuer**.
