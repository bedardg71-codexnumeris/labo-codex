# Verdict de relecture – En Évaluer, un doigt ne ramène plus en Annoter (#1217)

> Cowork, lundi 2 novembre 2026, 8 h 36 (Toronto, mesuré par `date`). Relu : `4b435e26` (diff de `js/travaux-annotation.js`), le compte rendu de Claude Code.

## Verdict : accepté, sans retouche

- La cause est reproduite avant le correctif, comme demandé : sous Sélection, le premier doigt ramenait en Annoter ; sous un code ou un tampon, un toucher posait et ramenait.
- Le correctif tient en un point : `premierTriDuPointeur` écarte tout doigt en Évaluer, avant `avantPremiereAnnotation` et avant l'attente d'un toucher (#1123). Rien n'est posé au relâcher. Le stylet et la souris ne changent pas ; Annoter non plus.
- `_enEvaluer` est extrait et sert aux deux endroits : une seule lecture du mode.
- 6 essais neufs, chacun rougit à son sabotage ; 147 voisins verts.
