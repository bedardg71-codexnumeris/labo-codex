# Rapport – Verdict rouge sur la 1.220.0 (26 oct. 2026, soir)

> Claude Code, lundi 26 oct. 2026, 18 h 25, pour Cowork. Consigne : `CONSIGNE-LOT-2026-10-26-mise-en-ligne-du-soir.md`, § 3 (« Rouge : ne pousse pas ; nomme le lot fautif par ses commits »). **Rien n'est poussé, rien n'est corrigé.**

## Le verdict

Sur `1473b15a` (release 1.220.0, build `1026-1646`), en dix morceaux (`scripts/morceau-playwright.mjs`, `caffeinate -d -i -s`, secteur, Cowork, Chrome et Safari fermés), rapports blob fusionnés, jugés par `scripts/juger-rapport-playwright.mjs` contre `playwright-baseline.json` :

| | |
|---|---|
| Essais | 1 046 : **1 044 verts**, 1 vert au second essai, **1 rouge**, 13 sautés |
| Baseline | 0 échec connu |
| Mémoire | 78 à 82 % libre aux dix relevés, échange 0,9 à 1,3 Go, secteur tout du long |
| Durée | 16 h 48 → 18 h 18 |

**Le rouge**, aux deux essais : `lot-C-echelles-chevrons-corbeille.spec.js` › « lot C · sous 768 px, la grille à deux colonnes du formulaire de groupe-cours et la rangée d'un sous-critère s'empilent » (l. 75). Attendu `{ groupeCours: 2, palier: 2, sousCritere: 3 }` à 1 200 px, reçu `palier: -1` : **la rangée de palier n'existe plus.**

**L'instable** (ne bloque pas, #534) : `presences-lot-d-enregistrement.spec.js` › (g), vert au second essai.

## Le lot fautif : 3a, `cddfd207`

- La spec (écrite le 5 sept., `2b9784b9`, inchangée depuis) mesure `#listeCriteres .palier-rangee`. `git log -S"palier-rangee" c07270a6..HEAD -- js styles.css` ne rend qu'un commit : **`cddfd207`** (lot 3a), qui a remplacé les rangées des paliers par la table (`.table-cas-rangee[data-palier-rangee]`) et retiré les règles `.palier-rangee*` (le verdict 3a le relève, § « styles.css »).
- **C'est la spec qui est périmée, pas l'application** (inférence appuyée sur deux mesures) : l'empilement de la table des paliers est mesuré, vert, dans `critere-algorithmique-table-de-cas.spec.js` (l. 226-245 : une colonne à 820 et 700 px, trois à 1 440 et 1 180 px, sans défilement de côté). Il se règle désormais sur la **largeur de la table** (`@container table-cas (max-width: 560px)`), plus sur celle de la fenêtre.
- Les deux autres mesures de la spec (groupe-cours, sous-critère) passent : #1038 et 3b ne sont pas en cause.
- Pourquoi les bancs du lot 3a ne l'ont pas vu : la spec lit une classe, pas un écran de l'atelier ; elle n'était pas parmi les 27 specs « qui touchent le critère » rejouées sur 3b, et la suite complète n'a tourné qu'ici.

## Ce que je propose (à décider)

Retoucher la spec du lot C, rien d'autre : retirer la mesure `palier` (l'empilement de la table est déjà tenu par la spec de 3a) ou la faire lire `[data-palier-rangee]` étape ouverte. Puis rejouer cette spec seule, refaire le commit (le jeton de verdict porte le SHA), et juger. Une suite complète de plus ne semble pas due pour une spec seule ; c'est à Cowork d'en juger.

## La retouche (consigne `CONSIGNE-LOT-2026-10-26-verdict-rouge-1220-retouche.md`, même soir)

- **Recalée, pas retirée.** La spec du lot C ouvre « Cas d'interprétation » (le clic sur l'étape de la chaîne, `data-ouverte` attendu) et lit `#listeCriteres [data-palier-rangee]`. Mesuré : `{ groupeCours: 2, palier: 3, sousCritere: 3 }` à 1 200 px, `{ 1, 1, 1 }` à 700 px. Le commentaire de la règle 3 dit que la rangée se règle sur la table (`@container table-cas`).
- **Break-test** : le bloc `@container table-cas (max-width: 560px)` des paliers retiré (`styles.css`, 8 lignes), la mesure à 700 px rougit aux deux essais (`palier: 3` au lieu de 1) ; restauré, `shasum` identique (`cbf8f8d2…`).
- **Rejouées en entier** : la spec du lot C, 2 vertes ; `critere-algorithmique-table-de-cas.spec.js`, 8 vertes, 1 sautée (les captures, sur demande).
- **Le trou : chaque identifiant retiré par 3a et 3b, cherché dans `tests/`** (`git diff cddfd207^ 27d5d610` sur `js/`, `index.html`, `styles.css` : 27 jetons disparus de la source, dont `palier-rangee` comme classe, `palier-apercu*`, `palier-projection`, `palier-note-composer`, `_idCollectionChoisie`, `modifierModeleProjectionGrilleHandler`, `modifierModeleProjectionTempHandler`). Hors la spec du lot C, quatre lectures, **aucune périmée, aucune recalée** :
  - `texte-troue-paliers-projection.spec.js` l. 182 et `sentinelle-texte-troue-etape-2-une-seule-carte.test.js` l. 245, 285 : `palier-apercu` attendu **absent** — sentinelles posées par 3a ;
  - `sentinelle-collections-gabarit.test.js` l. 381 : `_idCollectionChoisie` attendu **absent** — sentinelle ;
  - `atelier-algo.test.js` l. 248 : le gabarit jsdom de la zone des paliers **écrit** `class="palier-rangee"` sans que rien ne la lise (le code lit `[data-palier-index]`) — vestige inerte, issue 3 (rien à faire).
  - `copiesExemple` et les deux gestionnaires du menu « Modèle de projection » : aucune occurrence dans `tests/`.
- **Vu en chemin (issue 3, rien changé)** : la mesure `sousCritere` de la même spec lit une rangée de l'étape « Codes », fermée au chargement depuis 3a (déjà avant la retouche : mesuré, `getClientRects()` vide). WebKit rend alors la valeur déclarée (`80px 1fr 100px`, puis une colonne sous 768 px) : la mesure suit toujours la `@media` et reste discriminante.
