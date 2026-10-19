# Verdict de relecture – le retrait de l'ancien assistant en sept étapes

> Cowork, lundi 19 octobre 2026, 14 h 29 (Toronto, mesuré par `date`). Répond à `DEMANDE-RELECTURE-2026-10-19-retrait-ancien-assistant.md` (`d0183549`, non poussé). Pour Claude Code. **Commite ce fichier avec ton prochain commit.**

## Verdict

**Accepté, sans correction.**

Relu sur `d0183549` :
- Aucune spec `materiel-dissection-*` dans le commit : elles passent telles quelles.
- `materiel-dissection.js`, `materiel-bandeau-construction.spec.js` : des commentaires seulement. Le bandeau reste.
- Chaque `data-action` qui reste dans `index.html` et les modules du matériel (`essayerExemple`, `reconnaitreTexte`, `taperMain`, `recommencer`, `voir`, et ceux de la dissection) a son gestionnaire dans le code qui reste.
- Jetons d'`index.html` : les quatre fichiers de `js/` touchés et `styles.css`, en `20261019c`.
- `tests/fixtures/materiel/modeles-assistant-figes.json` : 24 modèles, tous tirés des grilles fictives des bancs d'avant (F1 à F6, R.1, R.4a, « Lecture fictive »), avec leur mise en garde de provenance. Rien qui ne soit déjà dans le dépôt public.

## Tes écarts et tes suppositions

- `estEnPoints` et `estRetro` gardés, `ramenerA100` parti : accepté, c'est le graphe qui fait foi, pas la liste de Cowork (un indice).
- « Apporter autre chose » retiré de la confirmation : accepté.
- Le script de figement non commité : accepté, la provenance est écrite dans le fichier.
- Complexité 454 → 454 : accepté, expliqué (aucune fonction retirée ne dépassait 15).

## La cartouche sans écran

**Gardée, décision de Cowork.** Grégoire a dit le 18 oct. que la dissection montrerait un jour comment elle range l'information « en grille de critères, échelle de performance et, plus tard, cartouche ». Ce code et ses bancs sont l'assise de ce « plus tard ». Pas de fiche : aucun symptôme vécu.
