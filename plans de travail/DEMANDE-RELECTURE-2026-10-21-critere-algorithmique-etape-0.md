# Demande de relecture – Le critère algorithmique, étape 0 (#1135)

> Claude Code, 21 octobre 2026, 9 h 55. Consigne : `CONSIGNE-LOT-2026-10-21-critere-algorithmique-etape-0.md` ; plan : `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`. Un commit sur `main`, non poussé, sans numéro de version ni verdict complet.

## Ce qui a changé

**La marque de naissance.** Un critère qui devient algorithmique (à sa création ou par un changement de type) porte désormais la marque `codesSousCriteresSeulement`. Elle est posée par `codesAnnotation.marquerNeuf`, appelée dans `avecProjectionNeuve` (`grilles.js`) au même geste et sous la même condition que `poserDefautNeuf` : le critère devient algorithmique sans avoir de modèle de projection. Pour un critère marqué, `codesAnnotation` rend ses sous-critères, et seulement eux. Sans sous-critère, aucun code, et la palette d'Annoter dit : « Aucun code : ajoute des sous-critères à ton critère algorithmique, dans la grille. »

**Le choix de la marque, et pourquoi.** J'ai mesuré les lecteurs de `codesDepuisSousCriteres` : `codes-annotation.js` (`estActive`), le gabarit (`grilles.js`, la case et `codesActifs`), et les schémas d'import et de partage. Ce drapeau ne convient pas, parce qu'un critère existant qui le porte sans sous-critère qui pèse retombe sur le repli. Le réutiliser à la naissance aurait donc changé ce stock. J'ai pris une clé neuve, que lisent seulement `codes-annotation.js` (`estActive`, `donneSesCodes`) et le gabarit. Elle est ajoutée aux deux schémas fermés (`import-export.js`, `partage-schemas.js`) : sans cela, une grille importée ou partagée perdrait la marque et retomberait sur le repli.

**Le gabarit d'un critère marqué.** La case « Utiliser ces sous-critères comme codes d'annotation » n'y apparaît plus : il n'y a pas de repli à choisir. La note d'une case cochée reste, dès qu'un sous-critère se pose. Le bouton devient « Partir de la liste du français écrit (codes 0 à 10) » ; les onze sous-critères qu'il donne ne changent pas.

**La ligne du PDF.** Elle prend la virgule décimale et garde les décimales d'hier (« 13,75/20 (68,8 %) »). « erreur » s'écrit au singulier sous 2, selon la règle `> 1` déjà employée ailleurs. Je n'ai pas trouvé de formateur partagé qui garde des décimales fixes : `formaterNombrePeriodes` arrondit à deux décimales et rendrait « 68,75 » pour le pourcentage. J'ai donc remplacé le point par une virgule après `toFixed`, comme une dizaine d'autres sites le font. « erreurs » et « mots » restent écrits en dur : c'est l'étape 2.

## Le stock

Un critère existant n'a pas la marque. Il garde ce qu'il porte, les dix codes du repli compris, et les copies déjà annotées gardent les noms de leurs codes. C'est vérifié sur la grille démo livrée : sa copie reçoit le repli, à l'octet près celui d'une copie sans grille. **Chez Grégoire, la seule chose qui change** est la ligne de tout PDF produit après le lot : la virgule et le singulier.

## Ce que j'ai mesuré en chemin

- **La démo n'a pas de ligne de calcul.** Les vingt évaluations du pack démo sous « Grille-5 FR-ALGO-20 H26 » sont en mode Catégories (`totalErreurs`, sans `erreurs`). Leur PDF n'a donc aucune ligne « N erreurs sur M mots ». C'est le constat 13, ajouté à #1133. La virgule est vérifiée sur la même copie démo, réécrite en mode simple (`pdf-ligne-virgule.png`). *Inscrire et continuer.*
- **Pour le lot de mots.** La description du modèle de formule « Pénalité normalisée » dit encore « Formule employée depuis l'origine pour le français écrit. » (`evaluation-formules.js`, l. 90). C'est le seul endroit où le gabarit d'un critère de chimie dit « français », hors des choix offerts : le bouton de la liste du français, et l'option « Français écrit » du modèle des phrases. C'est un texte d'aide, donc hors de ce lot. Le banc le retire par sa phrase exacte, nommément.

## Bancs

- **Vitest** `tests/unit/critere-algorithmique-etape-0.test.js`, 14 essais :
  - la naissance : en création, par un changement de type, et le stock qui porte déjà son modèle (pas de marque) ;
  - les codes : marqué sans sous-critère, aucun ; avec deux sous-critères, leurs deux codes ; sans la marque, le repli identique à hier ;
  - deux disciplines, « Français écrit » et « Unités et chiffres significatifs » : pour la chimie, ni le gabarit (hors des choix), ni la ligne, ni la phrase générique ne disent « français » ;
  - la ligne du PDF : « 0 erreur », « 1 erreur », « 2 erreurs », « 13,75/20 (68,8 %) » ;
  - la marque voyage : l'import et le partage la gardent.
- **Break-tests** (code restauré, vérifié par `cmp`) : la marque retirée de la naissance → 4 rouges ; le point décimal remis → 2 rouges ; la marque retirée des deux schémas → 2 rouges.
- **WebKit** `tests/integration/critere-algorithmique-etape-0.spec.js` :
  - une grille neuve « Laboratoire fictif », créée à l'écran : la palette invite à ajouter des sous-critères, sans « français » ;
  - la grille démo livrée : les mêmes codes qu'hier ;
  - le PDF : la démo sans ligne, et la virgule en mode simple.
- **Mis à jour** : la spec #1131 d'hier (un critère marqué n'a plus de case).
- **Ensemble** : 40 specs WebKit (Annoter, codes, PDF, Grilles, barème), 112 essais verts. Les 15 specs d'import et de partage, 50 essais verts. Vitest complet vert (chiffres au rapport de fin de session).
- ⚠ Le diff touche `js/import-export.js`. `CLAUDE.md` demande alors `npm test`, Vitest puis tout Playwright ; la consigne réserve ce verdict complet à ce soir. J'ai lancé Vitest et les specs d'import et de partage, pas le reste.

## Captures

`captures-2026-10-21-critere-algorithmique-etape-0/palette-critere-neuf-chimie.png` (la palette d'Annoter d'un critère neuf) ; `pdf-ligne-virgule.png` (« 7 erreurs sur 400 mots → 20,25/30 (67,5 %) »).

## Ce que je demande à la relecture

La clé neuve et ses deux schémas ; la case retirée pour un critère marqué ; la condition de marque, qui est celle du gabarit neuf. Une conséquence : un très ancien critère algorithmique, d'avant #668 et sans modèle de projection, que l'on ferait passer par un autre type puis revenir à « algorithmique » serait marqué. C'est le même comportement qu'aujourd'hui pour sa projection.
