# Rapport – Les tampons par défaut reviennent, et la bibliothèque perd les images SVG (#1216)

> Écrit par Claude Code le 1er novembre 2026, pour Cowork. Code : `a87f472c` sur `main`, ni poussé ni releasé (§ 4 de la consigne). Consigne : `CONSIGNE-LOT-2026-11-01-tampons-masques-et-bibliotheque.md`.
> Tout est mesuré au banc, noms fictifs, 1180 × 820. **Rien n'a touché ses données, et le vrai iPad n'a rien vu.**

## 1. Le tableau du cycle, AVANT correction

Personnalisation à son image : trois intégrés renommés, une catégorie « Rendu » avec trois tampons, deux tampons créés dans Observations (un SVG avec `width`/`height`, un avec `viewBox` seul), cinq images de 10 Ko environ. `personnalisationObservations` pèse alors 49 162 caractères : **absente de localStorage, présente dans IndexedDB seul** (seuil 25 Ki), dans les deux moteurs. `tamponsPersonnalises` (385) reste dans localStorage et IndexedDB.

| Étape | Noms des 3 intégrés, palette | Tampons créés, palette | `elementsMasques` | WebKit | Chrome |
|---|---|---|---|---|---|
| 1. Enregistrer | HOC, Mécanisme, Procédé | présents, avec image | écrit partout | identique | identique |
| 2. Recharger | **Id. directrice, Id. principale, Id. secondaire** | présents, **sans image** | lu, mais **effacé d'IndexedDB** | ✗ perdu | noms et images gardés ; **masques effacés partout** |
| 2 bis. Fenêtre | **noms par défaut** | avec image | – | ✗ | noms gardés |
| 3. Enregistrer, sans rien changer | noms par défaut | présents, **avec image** | réécrit | ✗ **écrit « Id. directrice »… en base** | noms gardés |
| 4. Recharger | noms par défaut, pour de bon | présents, sans image | – | ✗ | noms gardés |

**WebKit perd la course à chaque chargement, Chrome la gagne.** Le module applique les personnalisations avant que la base soit lue, et rien ne les réappliquait ensuite. C'est la piste 3, confirmée.

*Inférence, non prouvée* : l'étape 3 de WebKit est exactement sa capture de 19 h 44 (noms par défaut, tampons créés avec image) ; la fenêtre et la bibliothèque aux noms « HOC » sont l'étape 1, après qu'il a retapé et enregistré.

## 2. Ce qui dément ou corrige la consigne

**Le § 1 avait la bonne cause et le mauvais seuil.** Le bloc se déclenche bien plus tôt que « plus de 10 retirés » : sans rien retirer, chaque enregistrement écrit déjà 17 ids dans `elementsMasques` (14 anciens tampons et jetons, 3 symboles, que la fenêtre ne montre pas). **Un seul tampon créé et un seul enregistrement suffisent.**

| Retirés | WebKit, tuiles de la palette (enregistré → 1er, 2e, 3e chargement) | Chrome |
|---|---|---|
| 1 | `elementsMasques` 18 → 18, null, null | 18 → null, null, null |
| 10 | 14 → 14, **18**, 18 | 14 → **18**, 18, 18 |
| 11 | 13 → 13, **18**, 18 | 13 → **18**, 18, 18 |
| 20 | 4 → 4, **18**, 18 | 4 → **18**, 18, 18 |

Les 11 reviennent donc, comme attendu, mais **au 2e chargement en WebKit** : au 1er, l'effacement part vers IndexedDB et la lecture de la base remet l'ancienne valeur dans localStorage. Un essai à un seul rechargement restait vert en WebKit : le mien en fait trois et lit aussi IndexedDB.

**Le § 2 : l'hypothèse `naturalWidth = 0` est démentie.** Sept formes de SVG, mesurées dans les deux moteurs :

| SVG | WebKit | Chrome |
|---|---|---|
| `width`/`height` 96 | 96 × 96 | 96 × 96 |
| `viewBox` 96 seul | 96 × 96 | 150 × 150 |
| `viewBox` 24 seul | 24 × 24 | 150 × 150 |
| `viewBox` 512 × 256 seul | 512 × 256 | 300 × 150 |
| rien | 300 × 150 | 300 × 150 |
| `100%` | 96 × 96 | 150 × 150 |
| `1em` | **16 × 16** | **16 × 16** |

| Cas | Mesure avant correction |
|---|---|
| **a.** Créé, avec ou sans dimensions | Capture réussie, PNG, aperçu de la colonne bibliothèque correct. **Pas de défaut sur ce chemin.** |
| **b.** Intégré remplacé, 400 ms après Enregistrer | Capture réussie, son image. |
| **b.** Intégré remplacé, **après un rechargement** | WebKit : l'image en mémoire est celle **par défaut**. Au banc la capture rend `''` (canevas sali en `file://`) et l'aperçu retombe sur le fichier par défaut. Chrome : son image. *Inférence* : en ligne, même origine, la capture réussit et **garde une PNG de l'image par défaut**. C'est la préséance, par la même cause que le § 1 ci-dessus. |
| **Colonne « Dans ta palette »** | Toute image SVG y est **sans aperçu** : `sourceImageApercu` refuse le SVG, et le nom n'est plus un bouton. Dans les deux moteurs, à toutes les étapes. Hors de la lettre du § 2, mais c'est son « sans image visible ». |
| **c.** Gardé avant d'être personnalisé | Après personnalisation, palette : « HOC · Intégré · ✓ Aussi dans ta bibliothèque », aucun geste offert. Bibliothèque : « Id. directrice · Intégré · ✓ Déjà dans ta palette », ancien nom, ancienne image. **Rien construit.** Seule issue aujourd'hui : « Supprimer de ma bibliothèque », puis « Garder ». Choix d'interface à proposer. |

**Piste 2, confirmée mais forcée** : `tamponsPersonnalises` contenant un tampon en catégorie masquée et un en catégorie `diagnostic` ; Enregistrer rend `[]`. État écrit au banc : je n'ai pas prouvé qu'il soit le sien.

**Piste 4, NON REPRODUITE.** Dans les deux moteurs, à toutes les étapes, ses tampons créés sont dans la colonne « Dans ta palette ». La palette et la colonne lisent le même tableau `AUTOCOLLANTS`. *Inférence* : ils sont au bas d'une liste de 2 380 px (25 rangées sur ma capture), sans aperçu, donc faciles à ne pas voir. Sa capture de 19 h 42 reste à relire avec ça en tête : **je ne l'ai pas vue.** Le banc a tourné sur HEAD, pas sur la 1.229 (`6ab4f080`). Entre les deux (`git diff`), `tampons-bibliotheque.js`, `bibliotheque-ui.js` et `db.js` sont identiques ; dans `travaux-outils.js`, un `grep` des lignes changées ne trouve, côté tampons, que l'appel de rafraîchissement déplacé et le titre d'un bouton. *Inférence* : la mesure vaut pour la 1.229, sans que je l'y aie rejouée.

## 3. Ce qui est corrigé, à la source

| Défaut | Correctif | Source ou stock |
|---|---|---|
| Masques effacés au chargement | Bloc retiré. Autres écrivains audités (`grep`) : remappage RLO, Enregistrer, « Réinitialiser », import. Aucun autre hors d'un geste. | Source tarie. **Stock perdu.** |
| Noms par défaut, images absentes | `rechargerTamponsPersonnalises` rejoué à chaque `db-ready`, en fin de module. | Source tarie. Stock : voir § 5. |
| Tampons d'une catégorie non montrée qui sortent | L'enregistrement garde ceux d'une catégorie que la fenêtre n'a pas montrée à l'ouverture. Supprimer une catégorie montrée emporte toujours ses tampons. | Source tarie. Déjà sortis : perdus. |
| Capture | Attend le chargement. **Reste une PNG**, et une seule fonction pour les quatre appelants et l'export complet (`imageVersBase64`). | Source. Entrées déjà gardées : inchangées. |
| Aperçu de « Dans ta palette » | Montre la PNG d'une image SVG, jamais l'image par défaut. La règle de `sourceImageApercu` n'a pas bougé. | Rien de stocké. |

Jetons `?v=` : `travaux-outils.js` 20261031h, `tampons-bibliotheque.js` 20261031a (la sentinelle exige le jour du build ; la release les refera).

**Suppositions et décisions à moi** :
- **Plancher de 256 px pour un SVG, proportions gardées.** La consigne ne le demandait pas. Sans lui, un `1em` donne une vignette de 16 px. Les images déjà PNG et les fichiers intégrés ne changent pas.
- **Le repli carré sans dimensions est écrit comme demandé, mais aucune image réelle ne l'atteint au banc** : l'essai simule `naturalWidth = 0`. Je n'ai pas lu le `viewBox`, puisque aucun cas ne le demande.
- « Une catégorie inconnue » prend `diagnostic` comme le fait déjà `chargerTamponsPersonnalises`.

## 4. La preuve

- **Spec** `tests/integration/tampons-masques-bibliotheque-1216.spec.js`, 14 essais : WebKit 14/14 sur le code commité ; Chrome 14/14 avant le dernier commit, qui n'a ajouté que deux commentaires et changé les deux jetons.
- **Chrome** : celui du Mac, profil neuf, `channel: 'chrome'`, par une config hors dépôt. Chromium n'est pas installé ici et `playwright.chromium.config.js` vise un chemin de conteneur (`/opt/pw-browsers`).
- **Vitest entier** vert : 10 615. Il a rougi une fois sur mes premiers jetons (`20261101a`), corrigés.
- **Specs voisines WebKit** : `bibliotheque-deux-colonnes-1158`, `palette-tampons-categories`, `annotation-tampon-au-doigt-1123`, `annotation-tampon-premier-toucher-1209`, `bibliotheques-import-persistance`, `copie-demo-bibliotheque-31-oct`, `retroaction-760-759` : tout vert, 3 sautés par leurs conditions.
- **Pas de suite Playwright complète, pas de verdict** : ils partent avec la mise en ligne.
- **Mesure rejouée après correction** : les deux moteurs rendent le même résultat à toutes les étapes, masques stables sur trois chargements, 18 → 18, 13 → 13, 4 → 4, IndexedDB compris.

**Contre-épreuves, 20 changements volontaires, chaque fois remis** : 18 attrapés du premier coup, dont « remettre le bloc retiré » (3 essais de masques rouges), et le retrait du rejeu à `db-ready` (2 rouges). Les 2 autres :
- « Capture sans attendre le chargement » est resté **vert** : mon essai ne prouvait rien, une image `data:` est prête dans le même geste. Une première réécriture a échoué sur son propre préalable, et le rouge d'alors ne vaut donc rien. L'essai retarde maintenant lui-même le chargement : rouge.
- « Sans le `try` autour de l'attente », ajouté avec cet essai : rouge.

Limite : la course de chargement n'est perdue naturellement qu'en WebKit, et le rejeu à `db-ready` n'est prouvé que là. Chrome ne peut pas rougir sur ce point.

## 5. Ce que Grégoire devra refaire, une fois, sur l'iPad, après la mise en ligne

Rien n'écrit dans ses données, et il n'a rien à décider ici.

1. **Retirer de nouveau ses tampons par défaut.** Effacés à ses derniers chargements, ils ne se retrouvent pas. Les masques restent à l'appareil (#1183) : le Mac est à part.
2. **Regarder ses trois noms.** Si un « Enregistrer » est passé après un rechargement, les noms par défaut sont écrits en base : retaper « HOC », « Mécanisme », « Procédé », une fois. Sinon ils reviennent seuls.
3. **Ses images : rien à refaire.** Elles restent en base à chaque étape mesurée, et reviennent seules.
4. **Ce qu'il a déjà gardé dans la bibliothèque** : si l'image ou le nom est le mauvais, « Supprimer de ma bibliothèque », puis « Garder » (cas c).
5. **Avant la mise en ligne** : ne pas personnaliser davantage en 1.229. Chaque « Enregistrer » après un rechargement y réécrit les noms par défaut.

Porte terrain (trois gestes, la perte de données étant en jeu) : `PORTES-TERRAIN-2026-11-01-tampons-masques-et-bibliotheque.md`. **Artefact à publier par Cowork, après le push.**

## 6. Les trouvailles

- **Commentées et oubliées** (`js/travaux-outils.js`, `enregistrerRetroObservations`) : les 17 ids écrits sans retrait, sans conséquence observable une fois le bloc retiré ; la fenêtre ouverte avant la lecture de la base écrirait les noms par défaut, lu et non mesuré, aucun cas vécu.
- **Inscrite, sans changement** : #1166 n'est pas sur le chemin de a ou b.
- **À Cowork** : le cas c, pour une proposition à Grégoire.
