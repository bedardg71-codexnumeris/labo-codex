# Rapport pour Cowork – La copie garde sa taille d'ouverture (2 novembre 2026)

> Claude Code, lundi 2 novembre 2026, matin. Consigne : `CONSIGNE-LOT-2026-11-02-copie-garde-sa-taille.md` (commitée seule, `249d2e98`). **Poussé le 2 nov. à 7 h 45** après la vérification complète, verte (§ 5 bis).

## 1. La mesure

Largeur du document à l'ouverture d'une copie, en px. Banc WebKit, l'application servie par HTTP, une copie fictive : PDF lettre (612 × 792 pt) et image 400 × 600. « Plein écran » = « Ajuster » une fois en plein écran (voir plus bas).

| Écran | Copie | 1.229.0 (`6ab4f080`) | `main` avant (`249d2e98`) | `main` corrigé | Plein écran, les trois |
|---|---|---|---|---|---|
| 1180 × 820 | PDF | 510 | 323 | **510** | 602 |
| 1180 × 820 | image | 440 | 279 | **440** | 520 |
| 1280 × 720 | PDF | 432 | 246 | **432** | 525 |
| 1280 × 720 | image | 373 | 212 | **373** | 453 |

Hauteur du cadre de la copie, hors plein écran : 657 et 557 px dans la 1.229.0, 416 et 316 depuis `67e2f649`, inchangée par ce lot. La page ne défile plus (`main` avant et corrigé) ; elle défilait dans la 1.229.0. Le bas de la page s'atteint dans le cadre dans les douze cas.

**Fait, « Ajuster »** (`zoomAjuster`) après un zoom avant : sur les trois versions, il revient exactement à la largeur d'ouverture (510 → 571 → 510, etc.).

**Fait, plein écran** : passer en plein écran ne re-rend pas la copie, elle garde la taille qu'elle avait (sur les trois versions). « Ajuster » en plein écran rend la même largeur sur la 1.229.0 et sur `main` : le correctif n'y touche pas, et un essai le verrouille.

**Fait, à côté** : à l'ouverture en Annoter et en Évaluer, la taille n'est pas fixée par `ZOOM_FIT` mais par `zoomPleineHauteur` (`ZOOM_FIT_HEIGHT`), qu'appelle le passage de mode (`travaux-ui.js`, trois endroits). `zoomAjuster` n'a aucun bouton dans la visionneuse des travaux (seulement l'API). Le correctif couvre donc les deux modes.

## 2. Le correctif

**Le moyen, en une ligne** : en Annoter et en Évaluer, hors plein écran, la hauteur d'ajustement est celle qu'avait le cadre dans la 1.229.0 — la hauteur réelle du cadre, plus ce que la zone a perdu par rapport à `max(400, innerHeight − 120)` —, sans faire déborder le document en largeur au-delà de ce que le cadre réel faisait déjà (`_hauteurAjustement` et `_zoomAjuste`, `js/travaux-visionneuse.js`).

Écart mesuré à la 1.229.0 : **0 px** dans les huit cas. La zone reste dans l'écran ; ce qui dépasse le cadre se parcourt dans le cadre (la marge de 100vh autour du document assure la course). Ailleurs (Modélisation, plein écran), le cadre réel sert comme avant : le calcul n'est modifié que sous `.travaux-visionneuse-layout`, hors `.travaux-plein-ecran`.

**Ce que j'ai supposé** :
- `innerHeight` tient lieu du `100vh` de l'ancienne règle. Sur le banc, c'est identique. Sur l'iPad, `100vh` peut dépasser la hauteur visible quand les barres de Safari se replient ; or la page ne défile plus, elles ne se replient plus. La largeur y sera donc celle de la 1.229.0 barres affichées, ou quelques px de moins. Non mesuré sur l'iPad.
- En mode portrait étroit, où la 1.229.0 laissait déborder la copie en largeur en « pleine hauteur », elle ne déborde plus que jusqu'où le cadre court la faisait déjà déborder (consigne : « sans dépasser la largeur du cadre »).

## 3. Le témoin du zoom

`annotation-deux-doigts-page.spec.js`, « le pincement et le glissé cohabitent » : le témoin est un rapport (largeur après > 1,4 × largeur avant), le point visé est pris au tiers de la partie visible de la page, d'après le document, et deux assertions exigent que le point fixe tombe dans la page avant et après (0 < fx, fy < 1).

## 4. Les tests

Neuf : `visionneuse-copie-garde-sa-taille.spec.js`, quatre essais, à 1180 × 820 : largeur d'ouverture à 440 ± 2 px, la page ne défilant pas ; « Ajuster » après un zoom revient à 440 ; la molette puis deux doigts atteignent le bas de la page ; en plein écran, « Ajuster » rend 520 (pas de hauteur ajoutée).

**Contre-épreuves** (skill `verification-adverse`), chacune rejouée puis annulée, fichiers vérifiés propres :

| Sabotage | Essai | Résultat |
|---|---|---|
| Le correctif retiré (`travaux-visionneuse.js` de `HEAD`) | largeur d'ouverture | rouge, 279 au lieu de 440 (écart 161) |
| idem | « Ajuster » | rouge, écart 161 (après avoir rendu le témoin du zoom relatif : il tombait d'abord sur son témoin) |
| La garde du plein écran retirée | plein écran | rouge, écart 160 |
| Le cadre de la copie en `overflow: hidden` | bas atteint | rouge, bas du document à 1 063 px, cadre à 820 |
| Le pincement ne zoome qu'à 1,2 | témoin du zoom | rouge, rapport 1,198 < 1,4 |

Le témoin du zoom repasse **vert sur le code d'avant le correctif** : il ne dépend plus de la taille du cadre, ce qui était le but.

Un sabotage écarté, à dire : rogner le document (`height: 300px; overflow: hidden` sur son enveloppe) laisse l'essai du bas vert. Il juge la course du défilement, pas ce qui est peint ; ce rognage ne réduit pas la course. Ce n'est donc pas ce que l'essai prétend juger.

**Rejouées** : les specs `annotation-*`, `palette*`, `barre-outils-compacte`, `tampons-masques-bibliotheque-1216`, `visionneuse-*` et `profil-travaux-761` : 26 fichiers, 169 essais, **165 verts, 2 verts au second essai, 2 sautés, 0 rouge** (10,7 min). Les deux reprises (`barre-outils-compacte.spec.js:393`, `palette-retroaction-compacte.spec.js:254`) ont échoué la première fois sur `page.goto`, délai de 30 s dépassé : la page n'avait pas fini de charger, avant que la visionneuse ne s'exécute. **Inférence** : la charge de la machine, pas le lot.

**Vitest entier** : **863 fichiers, 10 615 essais, tous verts**, après le build. Avant le build, un rouge attendu : la sentinelle anti-cache exige le jeton du jour, que `--build-only` pose.

## 5. Version et état du dépôt

Version : **1.230.0**, build refait par `node scripts/release.mjs --build-only` (build `1101-2047` → `1102-0522` ; l'ancien build : zéro occurrence hors documents, le nouveau aux cinq points), jetons suivis ; les Nouvelles ne changent pas.

Avant la vérification, `main` local avait 30 commits d'avance sur `origin/main` ; après le push, aucun.

## 5 bis. La vérification complète : verte, poussée

Au signal de Grégoire (Cowork, Chrome et Safari fermés), `node scripts/verdict-en-morceaux.mjs` sur `97f0189a`, de 5 h 57 à 7 h 44, secteur, éveil tenu, pression mémoire 1 et 330 Mo d'échange à chaque relevé : **code 0**. 1 326 essais en dix morceaux : **1 320 verts, 2 au second essai, 4 rouges, tous les 4 connus (baseline), 23 sautés**. Le 1er nov., sur `46a0830d` : 1 322 essais, 5 rouges dont 1 nouveau (le témoin du zoom). Il n'y en a plus aucun de nouveau.

Les deux verts au second essai, qui ne bloquent pas : `bareme-3-evaluer.spec.js` (invariant 1) et `grilles-sous-criteres-condense.spec.js` (condensé). **Fait** : la seconde était déjà verte au second essai le 1er nov. sur `46a0830d`. Une deuxième fois de suite : à suivre, si elle revient au prochain verdict, c'est un sujet (crochet pré-push : « si la même revient, c'est un vrai sujet »).

`git push origin main` : crochet pré-push vert (Vitest, jeton à jour pour ce commit), `0fd0427f..97f0189a`. **La 1.230.0 est en ligne**, build `1102-0522`.

## 6. Trouvailles

- **Inscrire et continuer** (non inscrit : aucun symptôme vécu) : `zoomAjuster`, `zoomPleineLargeur` n'ont pas de bouton dans la visionneuse des travaux ; seule la Modélisation en a. Rien à faire tant que personne ne le réclame.
- **Porte terrain** : la largeur à l'ouverture sur l'iPad réel (supposition `innerHeight`, § 2). La question de la porte de la 1.230 sur la place de la copie peut s'y adosser.
