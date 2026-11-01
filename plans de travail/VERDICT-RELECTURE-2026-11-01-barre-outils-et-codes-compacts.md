# Verdict de relecture – La barre d'outils et la palette Codes compactes, la zone de travail dans l'écran

> Cowork, dimanche 1er novembre 2026, 16 h 29 (Toronto, mesuré par `date`). Relu : `4ed99788` (diff entier : `js/travaux-outils.js`, `js/travaux-ui.js`, `styles.css`, `barre-outils-compacte.spec.js`, `palette-evaluation-un-defilement-1214.spec.js`), la tête de `e00f9fe9`, `d8ada574`, `67e2f649`, `RAPPORT-2026-11-01-barre-outils-et-codes-compacts.md` et `PORTES-TERRAIN-2026-11-01-barre-outils-et-codes-compacts.md`.

## Verdict : accepté, sans retouche

- **Les essais de #1214 (le point à relire en priorité).** Le dernier critère se juge maintenant en le ramenant au haut du cadre, plus en bas du contenu. C'est le geste de l'œil, et l'essai rougit encore si la carte est plus haute que le cadre, coupée par lui, ou hors de l'écran. L'intention de #1214, un seul défilement jusqu'au critère algorithmique, reste portée par les autres mesures (`debordeAvant`, `cartesCoupees`, `barreVisible`), inchangées. Les rectangles lus avant le défilement ne dépendent pas de lui : aucune mesure n'est faussée par le `scrollTop` posé dans la fonction.
- **Le champ de rétroaction.** Hors plein écran, `>= 80` ne peut plus rougir : c'est le plancher du champ. La vraie mesure est passée en plein écran (`> 300`, 441 mesuré), et elle peut rougir. Accepté tel quel : l'essai dit ce qui est vrai aujourd'hui.
- **`--visionneuse-hors-zone` déclarée sur l'élément.** Risque vérifié : une déclaration sur la classe masquerait une valeur héritée d'un parent. Ici, `_mesurerHorsZoneVisionneuse` écrit la mesure en style en ligne sur le même élément (`js/travaux-ui.js:1191`) : elle l'emporte. La valeur de départ ne sert qu'avant la première mesure.
- **Les trois sentinelles.** `echapperHtml` sur une constante, `_marquerBadgeOuvert` extrait à l'identique, `#1b7a34` égal à la valeur de repli d'une variable jamais définie : rien ne change à l'écran. Aucun fichier de `tests/unit/` dans le diff : aucun cliquet relevé.
- **La pause de 400 ms** est gardée et nommée `pause-gardee :`, comme le demandait la consigne. Elle se comptera à la fusion de `lot/pauses-apres-ouverture`.
- **Les douze échecs d'`annotation-formes-fermees`** : délais dépassés à toutes les étapes, jusqu'au lancement du navigateur ; la spec passe aujourd'hui. L'inférence d'une machine saturée est la nôtre aussi, sans preuve, et les traces sont effacées. Rien dans le code.

## Ce qui en découle (décisions de Cowork)

- **La hauteur hors plein écran.** À 1180 × 820, la copie et les palettes ont 416 px, et le champ de rétroaction tombe à 80 px. Les deux consignes suivantes ont été écrites avant la partie C : elles reçoivent chacune une mesure hors plein écran, avant et après, à écrire au rapport. La question de la porte terrain reste posée à Grégoire, après la mise en ligne, quand les trois palettes auront leur version compacte.
- **La porte terrain** se publiera comme artefact à la mise en ligne de ce soir, réunie avec celles des deux lots suivants : même écran, même iPad, un seul passage.
- **Les 30 pauses les plus lourdes** reprennent après les lots d'Annoter, seules : à midi, deux suites d'essais en même temps ont précédé le redémarrage.
