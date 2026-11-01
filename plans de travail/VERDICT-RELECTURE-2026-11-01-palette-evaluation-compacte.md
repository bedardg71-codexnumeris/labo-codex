# Verdict de relecture – La palette Évaluation en version compacte

> Cowork, dimanche 1er novembre 2026, 17 h 55 (Toronto, mesuré par `date`). Relu : `6dd40044` (les rendus de `js/evaluation-chargement.js` et `js/accompagnement.js`, la largeur dans `styles.css` et `js/travaux-ui.js`, les deux bancs changés), `RAPPORT-2026-11-01-palette-evaluation-compacte.md` et `PORTES-TERRAIN-2026-11-01-palette-evaluation-compacte.md`.

## Verdict : accepté ; la largeur se corrige au lot de la Rétroaction

- **La place de la copie (le point lourd).** À l'ouverture, sur l'iPad, la copie passe de 468 à 272 pt : Paramètres s'élargit de 200 à 280, Évaluation de 200 à 316, et 88 pt restent vides entre Évaluation et Rétroaction. La cause est la consigne de Cowork (§ 2 bis, « qu'elles gagnent ») et des ébauches dessinées à 316 pt, avant que le lot du défilement mesure que la palette était à 200 : Grégoire n'a jamais vu ce prix. Or il a posé ce matin le but de la série : donner le plus de place possible au canevas.
- **Décision de Cowork**, au lot de la Rétroaction, qui touche déjà cette position : Paramètres revient à 200 pt d'ouverture, comme tout l'automne (sa largeur n'apportait rien) ; Évaluation garde ses 316 pt, ceux de l'ébauche validée, une ligne par critère ; elle se pose contre la Rétroaction réelle, sans les 88 pt vides. Attendu : 432 pt pour la copie si la Rétroaction reste à 200, environ 372 si elle passe aux 260 de son ébauche. La question de la porte terrain reste posée à Grégoire, sur l'iPad.
- **Sécurité.** La description passe par `textContent` dans la bulle ; le nom, la pondération et les niveaux par `echapperHtml`, l'`aria-label` par `echapperAttribut`. Rien d'inline.
- **Le contraste.** `--surface-input` et `--texte-principal` existent dans les deux modes (`styles.css` 260-261 et 531-550) : le navigateur sort de l'équation. Non prouvé, comme le dit le rapport : la porte terrain tranche.
- **Les suppositions** sont retenues : « Niveau : E » reste, seul endroit qui dit le niveau calculé ; la formule chiffrée part en compacte, elle reste en descriptions.
- **Les bancs.** Le vrai `echapperAttribut` dans le harnais, aucune assertion touchée ; `AU_DESSUS_DE_15` descend de 440 à 439, le cliquet se resserre. Les deux essais sautés sont identifiés : les captures sur demande de `critere-algorithmique-presentation` et de `palette-annotation-disposition`.
- **Les trois essais renforcés après une contre-épreuve restée verte** : c'est le break-test qui fait son travail.

## Pour ce soir

- `RELAIS.md` (trouvaille 3) : la consigne de la mise en ligne le met à jour, commits du 1er nov. et branches `lot/` comprises.
- La porte terrain se publie à la mise en ligne, réunie avec les deux autres lots.
