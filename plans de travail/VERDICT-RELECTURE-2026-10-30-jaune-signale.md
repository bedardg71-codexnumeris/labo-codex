# Verdict de relecture – Le jaune « signalé » loin de l'orange brûlé (d0b2f3f9)

> Cowork, samedi 31 octobre 2026, 6 h 56 (Toronto), sur `main` = `d0b2f3f9`. Relecture du diff (`styles.css`, `js/contexte-qualification.js`, `design-system.html`, la sentinelle, la spec WebKit), du rapport `RAPPORT-2026-10-30-jaune-signale.md` et des quatre captures. Écarts et contrastes recalculés hors du dépôt, par une autre implémentation que celle du dépôt. Aucun test lancé.

## Verdict

**Accepté.**

- Les valeurs sont celles de la proposition (rapport de l'orange, section « Proposition, non appliquée ») : `#facc15`, `#ffe082`, `rgba(250, 204, 21, 0.45)`, `#5f5200`. Le texte `#5f5200` y figurait en toutes lettres : ce n'était pas une supposition, la décision « appliquer les valeurs du rapport » le couvrait.
- Les trois jetons sont définis aux trois endroits où l'orange l'est (`:root`, `.mode-clair`, `@media print`). La liste les lit par `var()` dans un attribut `style`, comme l'orange ; seul appelant : `js/etudiants.js`.
- Recalcul indépendant (colour-science 0.4.7 : son CIEDE2000 et ses matrices de Machado 2009, pas `tests/unit/_helpers/ecart-daltonisme.js`) : toutes les paires de couleurs pleines retrouvent les chiffres du rapport au dixième, le jaune et le vert compris (34,5 · 8,7 · 16,0). Les paires de fonds transparents dépendent du fond réel, que je n'ai pas lu dans la page : sur `#12242e` et `#ebf5fc`, j'obtiens le même ordre (fond sombre 15,8 · 2,3 · 3,0 ; fond clair 19,5 · 19,0 · 18,0).
- Captures : le jaune se lit jaune dans les quatre ; en clair, la pastille jaune se distingue de l'orange par son fond.

## La liste en clair à 2,66:1 : l'issue 3 tient

Mesuré par balayage (pas de 4 sur rouge et vert, teinte 70° à 100°, chroma 35 ou plus) : aucune couleur qui tienne 4,5:1 sur la rangée paire `#ebf5fc` ne reste à 10 de `#A84400` en protanopie ET en deutéranopie, sauf des bruns très foncés (`#543400`) qui ne se lisent plus comme du jaune. Le conflit est réel : le contraste ou la séparation d'avec l'orange, pas les deux. Il ne remonte que sur un symptôme vécu.

## À Grégoire

Rien à décider sur ce lot. Restent ses mots : les six textes du réglage de l'axe, et « est orange brûlé » dans l'Aide du seuil.

## Pour Claude Code

Commiter ce verdict à part. Pas de push maintenant : les cinq commits en attente sur `main` (de `262c18bd` à `d0b2f3f9`) partent après le verdict complet du soir, selon la cadence du 11 octobre.
