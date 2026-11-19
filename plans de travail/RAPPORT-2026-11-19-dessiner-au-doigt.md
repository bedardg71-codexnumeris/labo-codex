# Rapport du lot `lot/dessiner-au-doigt` (#1288)

**Relais (19 nov. 2026).** Branche `lot/dessiner-au-doigt`, partie de `origin/lot/perspective-coins` (`23528f3`) ; les
deux partent ensemble. Fait : le choix « Dessiner au doigt » (palette d'annotation, compacte et étendue, écran tactile
seulement), sa décision pure (`js/annotation-doigt.js`), son application (`js/travaux-annotation.js`), sa clé
`laboCodex.dessinerAuDoigt` au registre, #1288 au BACKLOG, la porte terrain
(`PORTES-TERRAIN-2026-11-19-dessiner-au-doigt.md`). Reste : la porte terrain sur l'iPad, le banc WebKit au Mac.
Ni fusion, ni release, ni Nouvelles.

## Décisions prises seul (corrigeables)

- **Clé** : `laboCodex.dessinerAuDoigt`, `{ allume: bool }`, `localStorage` direct, du genre de `laboCodex.aideMateriel` ;
  rien de retenu dans la démo (l'état vaut pour la visite).
- **`touch-action` du canevas** : `none` dans les deux états, inchangé. Éteint, c'est l'état d'avant (break-test « à
  l'identique ») ; allumé, le doigt doit appartenir au tracé, et deux doigts défilent et pincent par le code de la
  visionneuse (`amorcerPanDeuxDoigts`, gestes Safari), qui ne dépend pas du `touch-action`.
- **Polygone** : allumé, il se pose sommet par sommet d'un toucher (comme Texte), pas en glissant.
- **Le crayon** : posé, il abandonne un trait du doigt commencé (la paume arrivée la première) ; un doigt posé pendant
  qu'il écrit, ou dans les 500 ms qui suivent un de ses gestes (survol compris), est la paume.
- **Écran tactile** : `navigator.maxTouchPoints > 0` ou `(any-pointer: coarse)`.

## Écart avec le relais

Le relais dit « éteint, le doigt défile ». **Mesuré** (Chromium, vrais gestes tactiles) : sur la copie, choix éteint, un
doigt seul ne défile pas (le canevas est à `touch-action: none` depuis toujours) ; hors de la copie, il défile. Le banc
fige ce comportement d'avant ; le changer serait un autre lot.
