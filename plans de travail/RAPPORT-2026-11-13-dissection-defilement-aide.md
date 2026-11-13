# Rapport du lot `lot/dissection-defilement-aide` — la grille ne remonte plus (13 nov. 2026)

**Relais.** Branche `lot/dissection-defilement-aide`, partie de `main` (`2a7aa59b8`, la 1.245.0). Mandat : relais de
Cowork du 13 nov. 2026 (rapport de bug de Grégoire, 16 h 46, iPad Safari 27.2, 820 × 1180). Bug inscrit **#1276**
(`Retours des testeurs/SUIVI-BUGS.md`). **Fait** : le correctif, la spec neuve, trois specs réécrites, poussé sur la
branche. **Reste** : la relecture de Cowork, la fusion vers `main` (Grégoire, du Mac), le geste sur l'iPad.
Indépendant de `lot/etiquette-sous-total` ; les deux touchent `js/materiel-dissection.js` à des endroits distincts.

## Le symptôme, dans les mots de Grégoire

« À chaque fois que je clique sur un élément, l'affichage de la grille remonte en haut de la page. »

## Les causes : deux, pas une

1. **Celle du mandat, confirmée.** `finSurlignage` remettait `etiquetteAmenee` et `morceauAmene` à `null` après
   chaque geste d'étiquetage ; au redessin suivant, `aide()` ramenait le canevas au morceau que la carte désigne et la
   légende à l'étiquette désignée.
2. **Une seconde, trouvée au banc** (le correctif du mandat seul laissait le test rouge). Le moteur de la carte amène
   lui-même l'élément qu'il entoure quand son contour change (`suivreContour`, `js/parcours-moteur.js`,
   `scrollIntoView`). Dès que le contour passait à un morceau hors de vue (étiquette désignée déjà en main, ou cachée
   dans la légende), le canevas défilait vers lui. Le moteur n'est pas modifié : c'est la carte de la page qui ne lui
   donne plus ce contour-là.

## Ce que le lot fait

- **Un geste d'étiquetage ne fait plus défiler ni le canevas ni la légende** : la remise à `null` est retirée.
- **Le canevas n'est amené que sur demande** (`canevasAAmener`, `js/materiel-dissection.js`) : à l'ouverture de la
  dissection, et quand la personne rouvre la carte par son interrupteur (`amenerLeMorceauDesigne`, appelé par
  `basculer`, `js/materiel-aide.js`). `morceauAmene` est retiré.
- **Un morceau défilé hors du canevas n'est plus le contour de la carte** (`morceauVu`, calculé par `aide()`, lu par
  `premierGesteDeLAide`).
- **Inchangé** : la légende est amenée quand l'étiquette désignée CHANGE (essai L7).

## Ce que j'ai supposé, à relire

- « Quand la personne agit sur la carte » : la carte n'a qu'un geste, son interrupteur. C'est lui qui amène.
- **Prendre l'étiquette que la carte désigne n'amène plus le morceau à toucher.** Avant, par la cause 2, le canevas
  y allait. Le mandat réserve l'amenée à l'ouverture et à la carte ; j'ai suivi. Si ce geste devait amener, c'est une
  ligne (`choisir` appelle `amenerLeMorceauDesigne`).
- **Conséquence visible** : à 820 de large, après un étiquetage dans la colonne de droite, le morceau désigné à gauche,
  sorti du canevas, ne reçoit ni flèche ni halo tant que la personne n'y revient pas. C'est le « ou rien » du mandat.

## Source ou stock

Source seulement. Rien n'est écrit chez les gens ; aucun brouillon ne change de sens.

## Tests

- **Neuf** : `tests/integration/dissection-defilement-aide-2026-11-13.spec.js`, 820 × 1180, grille fictive de 40
  critères. D1 : trois morceaux étiquetés en bas, le canevas et la légende ne bougent pas (à 1 px près). D2 : le
  morceau désigné change à la suite d'un geste, le canevas ne bouge pas ; l'interrupteur rouvert l'y amène.
- **Break-tests, trois, chacun rouge pour sa raison** (correctif retiré, test passé, correctif remis) :
  - A, `finSurlignage` redemande l'amenée : D1 « après « Critère fictif 40 », le canevas n'a pas bougé (680 → 0) » ;
    D2 « le morceau désigné a changé, le canevas n'a pas bougé (680 → 0) » ;
  - B, le morceau hors de vue redevient le contour : D1 et D2 rouges, le canevas revient à 0 dès qu'il est défilé ;
  - C, l'interrupteur ne demande plus l'amenée : D2 « la carte rouverte amène « / 3 » dans le canevas », reçu 680.
- **Sur `main`, avant le correctif** : D1 et D2 rouges (le canevas revient à 0), par la cause 2 ; la cause 1 est
  isolée par le break-test A.
- **Réécrits** : L6 (`dissection-legende-2026-11-12`) attendait qu'un geste ramène l'étiquette : il attend maintenant
  que la légende ne bouge pas et que la carte vise la pastille. I2 (`carte-aide-materiel-2026-11-13`) et P4
  (`dissection-ipad-2026-11-12`) attendaient une flèche vers un morceau ramené : `flecheVersMorceau`
  (`harness/fleches-de-banc.js`) vérifie que rien ne le vise tant qu'il est caché, que le canevas ne bouge pas, puis
  que la flèche s'y pose quand la personne y revient.
- **Passages** : Vitest 923 fichiers, 11 513 essais, verts. Playwright WebKit du Mac, passage ciblé (dissection,
  carte, parcours « Évaluer ») : 57 passés. La suite Playwright complète n'a pas été passée.

## Geste à rendre à Grégoire

Sur l'iPad, carte ouverte, descendre dans la grille et étiqueter plusieurs morceaux de suite : la grille reste où il
l'a laissée.
