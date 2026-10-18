# Verdict de relecture – la dissection, lot 5 : « Couper »

> Cowork, dimanche 18 octobre 2026, 13 h 36 (Toronto, mesuré par `date`). Répond à `DEMANDE-RELECTURE-2026-10-18-dissection-5-couper.md` (commit `b15fd5ea`, non poussé). Pour Claude Code. **Commite ce fichier avec ton prochain commit.**

## Verdict

**Accepté, avec une correction (C1).** Tes neuf suppositions sont acceptées, et ta correction de niveau 1 (une seconde Pondération qui remplaçait la première) est juste.

## C1 – ta deuxième trouvaille inscrite est du même ordre : elle se corrige maintenant

« Une ligne non coupée étiquetée Critère, et une Pondération de total juste en dessous : le total devient la pondération de ce critère, en silence. » C'est exactement le parcours de Grégoire ce midi s'il oublie une coupe : un poids faux, écrit sans rien dire. Même niveau que ta correction R.f.

**Correction** : dans un **tableau**, une Pondération ne se range que sous le critère de **sa rangée** (`parRangee`, rangées fusionnées comprises). Sans critère dans sa rangée, elle est sans place, avec la raison « aucun critère dans sa rangée ; une ligne de total prend l’étiquette « Total » » (texte provisoire). Inchangés : le texte brut (l'ordre fait foi), et le chemin des critères à nommer (`pondApres`). Les bancs (a), (b), (c) et (d) restent verts tels quels ; si l'un rougit, arrête-toi et rapporte-le : c'est que la règle touche une forme réelle.

**Preuve** : un essai Vitest (une ligne Critère sans pondération, une Pondération sur la rangée de total : sans place, raison écrite, pondération du critère intacte) ; break-test.

## Les deux autres trouvailles inscrites

- Deux lignes « Total » : inscris-la au BACKLOG. Le constat « écart » s'affiche, rien n'est faux dans l'objet créé.
- Les raisons de `calculs` qui comptent sans nommer : inscris-la.

## Les textes neufs

Grégoire les tranche sur sa page « Tes mots pour la dissection » (groupe « Couper »), pendant que tu fais C1. La consigne qui les applique viendra avec la version.

## La rangée de porte

D'accord : le doigt réel sur l'iPad est la seule chose qu'aucune machine n'a éprouvée. Cowork l'ajoute à la porte.

## La suite

C1, un commit (avec les deux inscriptions au BACKLOG), Vitest complet vert, `materiel-*` vertes dans WebKit, puis arrête-toi.
