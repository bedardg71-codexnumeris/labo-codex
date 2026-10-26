# Verdict de relecture – La table de cas, lot 3a (26 oct. 2026)

> Cowork, lundi 26 octobre 2026, 14 h 40 (Toronto, mesuré par `date`). Relu : `DEMANDE-RELECTURE-2026-10-26-table-de-cas-3a.md`, `PORTES-TERRAIN-2026-10-26-table-de-cas-3a.md`, `cddfd207` (la liste des fichiers ; le diff de `styles.css` ; les interpolations ajoutées dans `js/grilles.js` ; les textes d'écran de `js/atelier-algo.js` et `js/palette-algo.js`), la liste des cas du banc neuf et ses break-tests, le banc retiré (`sentinelle-texte-troue-etape-2-apercu.test.js`, lu à `cddfd207^`), le cliquet #467, `VERDICT-RELECTURE-2026-10-22-critere-algorithmique-noms.md`.
> **Pas relancé par Cowork** : Vitest, WebKit, les captures (hors des dossiers connectés). Le relevé du stock (six critères × 66 copies, à l'octet) est accepté sur la preuve de la demande.

## Verdict : **accepté, sans retouche**

L'étape est celle de l'ébauche validée : « Cas d'interprétation », la table des paliers qui reprend tout ce que faisait la carte (seuils, ajout et retrait, signalement, lien, collections), « Fixer » et « Retirer la limite » sans perte, la simulation au conditionnel, « étudiant·e » partout dans l'atelier. Un critère existant lit ce qu'il lisait.

## 1. L'écart sur la marque d'un critère neuf : Claude Code a raison, l'erreur est dans la consigne

La consigne (§ 1.2) désignait la marque des codes, `codesSousCriteresSeulement`. Le 22 oct. à 17 h 40, Cowork l'avait déjà écartée pour tout ce que lit l'étudiant·e et avait créé `nomsAttendus` (`VERDICT-RELECTURE-2026-10-22-critere-algorithmique-noms.md`, l. 18-31) : la marque des codes est en ligne depuis la 1.213.0, la lire aurait changé sans geste les critères créés les 21 et 22 oct. **La consigne a refait la même erreur ; Claude Code l'a vue et a pris `nomsAttendus`.** Décision de Cowork : **on garde `nomsAttendus`**. Elle ne change rien pour personne, conformément au § 1.2 de la consigne lui-même ; aucune décision ne remonte à Grégoire. Le cas G.b la protège.

## 2. Les six décisions des portes terrain (§ 3) : toutes acceptées par Cowork

| | Décision de Claude Code | Cowork |
|---|---|---|
| 3.1 | La marque des noms | **Accepté** (§ 1). |
| 3.2 | « « X » par rapport aux « Y » » | **Accepté.** L'ébauche accordait « rapportées » au féminin pluriel ; faux pour « défauts ». Même motif que la décision 3 du verdict du 24 oct. L'erreur était dans l'ébauche. |
| 3.3 | La phrase « Pour lui écrire un texte par code… » retirée | **Accepté** : elle désigne un geste du lot 3b ; elle revient avec lui. |
| 3.4 | La palette compacte sans valeurs | **Accepté** : règle du 22 oct. |
| 3.5 | « Compte projeté » | **Accepté** : un mot d'écran que l'enseignant·e lit, sans discipline. |
| 3.6 | « Décompte des unités manquantes » | **Accepté** : plus explicite que « Décompte », ce que Grégoire cherchait le 26 oct. |

Les deux écarts nommés hors du tableau (« Enregistrer ces paliers sous un nom… » seulement avec une limite ; le résumé de l'étape à régler) : **acceptés**.

## 3. Ce que Cowork a vérifié

1. **`styles.css` après le `git checkout`** : le diff ne retire que les règles de l'aperçu par palier (`.palier-apercu*`, `.palier-rangee*`), parties avec lui ; il n'ajoute que les règles du lot. Aucune règle étrangère au lot n'a disparu.
2. **Le banc retiré** éprouvait la ligne « L'élève lira : » sous chaque palier et `copiesExemple`, partis tous deux ; plus aucun lecteur de `copiesExemple` dans `js/` ni `tests/`. Son essai central (chaque palier atteint par sa copie, seuils déplacés compris) a un successeur : H.c (« Voir ce que l'étudiant·e lirait à ce palier », par le calcul). Retrait justifié.
3. **Le cliquet #467 (66 → 80)** : les quatorze interpolations nouvelles sont des fragments construits par le code, des noms de gestionnaires, des identifiants passés par `esc` à leur construction (`ident`) ou des nombres. La seule donnée nommée vue, `r.collection.nom`, était déjà là et passe par `notifications.succes`, qui pose en `textContent`. Rien d'écrit par l'enseignant·e n'est interpolé brut.
4. **Aucun gestionnaire en ligne** ajouté ; aucun `console.log`.
5. **Les mots** : plus aucun « élève » dans les textes d'écran de `atelier-algo.js`, `palette-algo.js` et `grilles.js` (les commentaires seulement) ; aucun futur dans les chaînes de l'atelier.

## 4. Portes terrain

D'accord avec les trois portes, toutes sur l'iPad réel, après le push. Cowork publie l'artefact jumeau.

## 5. La suite

1. Le verdict complet (en dix morceaux), la release et le push : au signal de Grégoire, le soir, Cowork et Safari fermés.
2. Les portes de l'iPad, sur la version en ligne.
3. La consigne du lot 3b (les tables que l'enseignant·e ajoute), à écrire par Cowork sur le code de `cddfd207`.
