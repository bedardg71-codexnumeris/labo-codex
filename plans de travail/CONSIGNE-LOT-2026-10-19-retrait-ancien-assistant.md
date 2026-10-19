# Consigne – retirer les écrans de l'ancien assistant en sept étapes

> Écrite par Cowork le lundi 19 octobre 2026 à 13 h 52 (Toronto, mesuré par `date`). **Décision de Grégoire, 13 h 51** : « Oui, on le retire. » C'est la dernière condition pour clore le chantier « Apporter mon matériel » (règle zéro-dette de `CLAUDE.md` : un chantier n'est fini que quand l'ancien système est retiré). L'assistant est débranché depuis le 18 (dissection, lot 1) : plus aucun geste ne l'ouvre. Règles 2 et 7 de `PROTOCOLE.md`. Pas de verdict complet, pas de version.

## Ce qui part, ce qui reste

- **Part** : ce que seuls les écrans de l'assistant appelaient. Dans `materiel.js`, ses écrans et son état (`assistantHtml`, `ouvrirAssistant`, `charger`, les étapes, le menu de rôle de l'aperçu…), leurs textes et leur CSS. Dans `materiel-assistant.js` et `materiel-lecture.js`, les fonctions que plus rien d'autre n'appelle. Mesuré par Cowork (indice, pas preuve) : quatorze exports de `materielAssistant` ne servent qu'à `materiel.js` (`ajouterCritere`, `ajouterNiveau`, `annuler`, `choisirNature`, `choisirRole`, `choisirSens`, `choisirSuiteNom`, `ecarter`, `estEnPoints`, `estRetro`, `etapesPour`, `placer`, `preparer`, `recalculerEtapes`).
- **Reste** : tout ce que la dissection, la création et Grilles de critères emploient (`construire`, `calculs`, `etatSaisi`, `nombre`, les bornes `MAX_*`, la lecture du collage, la confirmation `montrerCreee` et « Aller plus loin avec ta grille »). Le bandeau « en développement » reste (il part sur décision de Grégoire seulement).

## Ce qu'il faut

1. **Avant de retirer une fonction, ses appelants** : zéro hors du code qui part (grep sur `js/`, `index.html`, les `data-action` et `data-on-change`). La liste de ce qui part, fonction par fonction, va dans la demande.
2. **Rien ne change à l'écran** : l'onglet, l'accueil, la dissection, « Taper ma grille à la main », la confirmation de création. Les specs `materiel-dissection-*` passent **sans être modifiées**.
3. **Les données** : si une clé de stockage ne servait qu'à l'assistant, ne l'efface pas chez les gens. Dis-le dans la demande, avec ce qu'il en reste (« tarir n'est pas réparer »).
4. **Les bancs** : ceux qui ne vérifiaient que les écrans de l'assistant partent avec eux ; liste-les avec ce que chacun vérifiait. Ceux qui vérifient la logique commune restent. Aucun banc affaibli pour passer.
5. **Le garde-fou de complexité** (#1051) : le nombre de fonctions compliquées doit baisser ; donne les deux chiffres.
6. **Le BACKLOG** : une fiche qui ne concernait que l'assistant devient « périmée », avec son motif. Aucune fiche neuve sans symptôme vécu.
7. Les jetons d'`index.html` pour chaque fichier de `js/` et `styles.css` touché ; `docs/` et `DATA-OWNERSHIP.md` si l'assistant y est décrit.

## Livrer

Un commit sur `main`, avec cette consigne, la consigne du jour et son archive, et `VERDICT-RELECTURE-2026-10-19-fusion-verdict-github.md`. Vitest complet vert ; les specs `materiel-*` et Grilles de critères vertes dans WebKit. La demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-19-retrait-ancien-assistant.md`, avec le nombre de lignes retirées. **Puis arrête-toi** : pas de verdict complet, pas de version, pas de push.
