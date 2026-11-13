# Rapport du lot `lot/etiquette-sous-total` — l'étiquette « Sous-total » (13 nov. 2026)

**Relais.** Branche `lot/etiquette-sous-total`, partie de `main` (`2a7aa59b8`, la 1.245.0). Mandat : relais de Cowork du
13 nov. 2026 (retour terrain de Grégoire, iPad, Conception › Mon matériel). **Fait** : l'étiquette, la lecture des
tranches, le bilan, les pastilles, les bancs ; poussé sur la branche. **Reste** : la relecture de Cowork ; la validation
par Grégoire des textes (ci-dessous) ; la fusion vers `main` (Grégoire, du Mac) ; le geste sur l'iPad. Interrompu en
cours de route par `lot/dissection-defilement-aide` (#1276, retour testeur), mené sur sa propre branche.

⚠ **À la fusion** : les deux lots changent le jeton d'URL de `js/materiel-dissection.js` dans `index.html`
(`20261113f` sur le lot du défilement, `20261113g` ici). Le conflit est voulu : garder un jeton JAMAIS servi (`g`, ou
`h` si les deux sont fusionnés l'un après l'autre), sinon le navigateur sert une version périmée.

## Le symptôme

Une grille à quatre tableaux fermés chacun par un sous-total (/18, /17,5, /17, /6), un grand total (/58,5) et une
conversion (« Résultat sur 80 »). « Total » posé sur sept morceaux : « Somme des pondérations : 18 · ton total : 197 :
écart ». La règle #1106 ne reconnaît un total général que s'il est le DERNIER « Total » et vaut la somme des précédents.

## Ce que le lot fait

- **L'étiquette** `soustotal`, « Sous-total », « Le total d'une partie de la grille », dans « La grille », juste avant
  « Total » (`D.TYPES`), et dans `DE_GRILLE` (posée à côté de codes, la liste de codes est refusée). Seules
  énumérations de `'total'` dans le code : ces deux-là (mesuré par `grep`).
- **La lecture** (`js/materiel-dissection-lecture.js`). Un « Sous-total » ferme la tranche des critères lus depuis le
  « Sous-total » précédent, pas depuis la « Section ». `R.sousTotaux` : `{ t, id, ecrit, somme, ok }` par tranche ;
  chaque critère porte `tranche`. Les sous-totaux n'entrent pas dans `R.totaux`.
- **Le bilan** (`totalDuBilan`). Le total visé est le « Total » étiqueté ; sans « Total », la somme des sous-totaux.
  `totalOk` compare toujours ce total à la somme de toutes les pondérations.
- **Les pastilles** (`rendreConstatsSousTotaux`, `js/materiel-dissection.js`) : une par tranche en écart ; si toutes
  celles qui se comparent tombent juste, une seule.
- **La couleur** : une variable neuve, `--dis-c-soustotal` / `--dis-h-soustotal` (`styles.css`), sombre `#e58fe0`,
  clair `#a3239c`. Raison écrite dans le CSS : « Sous-total » et « Total » se posent côte à côte sur la même grille.
  Contraste mesuré : 6,41 sur blanc, 7,51 sur fond sombre (« Total » : 6,86 et 7,39).

## #1106 n'est pas touché — source ET stock

Une grille étiquetée avec plusieurs « Total » et AUCUN « Sous-total » se lit exactement comme avant : `totalVise` et
`LIRE_CADRE.total` n'ont pas changé d'une ligne ; le seul ajout au bilan ne s'exécute que si `R.sousTotaux` n'est pas
vide. Les étiquetages en cours chez les gens (brouillons) ne changent pas de sens : aucun ne porte `soustotal`, et
`lireBrouillon` n'a pas été touché. Verrouillé par le banc de #1106 (4 essais, inchangé) et par deux essais neufs, dont
« le stock : la grille de Grégoire étiquetée « Total » partout se lit comme le 13 nov. (197, écart) ».

## Ce que j'ai supposé, à relire

- **Un sous-total ferme aussi le critère en cours.** En texte brut, une pondération qui le suit n'est à personne.
- **Une tranche dont aucun critère n'a de poids ne se compare pas** (`ok` : `null`, aucune pastille), comme `totalOk`.
- **Un « Sous-total » sans nombre** va aux morceaux sans place, raison « aucun nombre » (texte existant).
- **Des critères lus après le dernier « Sous-total »** n'ont pas de tranche ; ils comptent dans la somme générale.
- **Un écart de sous-total ne bloque pas « Créer ma grille »** : c'est un constat, comme l'écart du total.
- **La teinte** de la couleur (un magenta, entre « Total » et « Points ») : à juger sur capture par Cowork.

## Textes à valider par Grégoire (lus par l'enseignant·e seulement)

Ceux de la consigne, tels quels : « Sous-total » ; « Le total d'une partie de la grille » ; « Sous-total de 18 : ses
critères donnent 15,5 : écart » ; « Sous-totaux ✓ ».

## Trouvailles — les trois issues

- **Inscrit, #1277** : « Résultat sur 80 », une conversion étiquetée « Total » après un « Total », ramène l'écart
  (138,5). Question de didactique, elle remonte à Grégoire. Un essai « hors lot, état connu » fige l'état d'aujourd'hui.
- **Corrigé dans le lot (le mien)** : `D.bilan` passait au-dessus de 15 de complexité (sentinelle « contenir », 435
  pour 434) ; le calcul du total visé est sorti dans `totalDuBilan`.
- **Hors lot, non touché ici** : le rapport « la grille remonte » (#1276), sur `lot/dissection-defilement-aide`.

## Tests

- **Vitest** `tests/unit/materiel-dissection-sous-total-2026-11-13.test.js`, 12 essais : quatre tranches justes et le
  total juste ; la tranche part du sous-total, pas de la section ; une tranche en écart ; des sous-totaux sans
  « Total » ; sans nombre ; sans poids ; le critère fermé ; #1106 (deux essais) ; l'état connu de la conversion.
- **Break-tests de la lecture** (correctif retiré, banc passé, correctif remis) : A, le sous-total entre dans
  `R.totaux` : 3 rouges ; C, sans « Total », pas de somme : 2 rouges ; D, #1106 retiré (`totalVise` rend le dernier) :
  4 rouges, dont 1 du banc #1106 ; E, le sous-total ne ferme plus le critère : 1 rouge (après resserrage de l'essai,
  qui passait d'abord vert) ; F, la tranche toujours 0 : 5 rouges. Une mutation, B, était sans effet : écartée.
- **Playwright WebKit** `tests/integration/materiel-dissection-sous-total-2026-11-13.spec.js`, 820 × 1180, 3 essais :
  S1 la légende (17 étiquettes, « Sous-total » avant « Total », sa couleur à elle dans les deux modes, cible ≥ 44 px)
  et le geste rendu à Grégoire ; S2 la grille entière, « Sous-totaux ✓ » ; S3 la pastille d'écart.
  Break-tests : G, les pastilles retirées : 3 rouges ; H, la classe de couleur retirée : S1 rouge.
- **Modifié** : `materiel-dissection-1.spec.js`, seize étiquettes → dix-sept.
- Grille fictive partagée : `tests/unit/_helpers/grille-fictive-sous-totaux.js` (la forme de la grille du terrain,
  textes inventés).

## Geste à rendre à Grégoire

Sur l'iPad, dans « Étiquette ta grille », prendre « Sous-total », toucher « /18 » : la pastille dit si les critères
au-dessus donnent bien 18.
