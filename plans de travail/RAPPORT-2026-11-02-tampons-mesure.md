# Rapport pour Cowork – Tous les tampons dans la bibliothèque : la mesure (2 novembre 2026)

> Claude Code, lundi 2 novembre 2026, matin, sur `main` = `2acef748` (1.230.0). Consigne : `CONSIGNE-LOT-2026-11-02-tampons-tous-dans-la-bibliotheque-mesure-et-plan.md`. Plan : `PLAN-2026-11-02-tampons-tous-dans-la-bibliotheque.md`. **Aucun code, aucune release.** Interrompu par #1217, repris ensuite.

## Comment c'est mesuré

Un banc jetable (non commité : le lot est sans code), monté sur celui des palettes d'annotation : le vrai `index.html`, une copie fictive en Annoter, des tampons créés par la vraie fenêtre, des images fabriquées, noms fictifs. Joué dans WebKit **et** dans Chrome : **résultats identiques**. Ce qui est « peint » : l'image du tampon passe-t-elle par `drawImage` au re-rendu (en `file://`, le canevas est souillé et ne se lit pas). Le PDF de l'élève n'est pas généré : il passe par le même résolveur d'image que l'écran (`getImageAutocollant`, `js/travaux-export-pdf.js:343-347`, **lu**). La forme de l'export de Grégoire a servi de modèle (24 tampons, 10 créés, 24 images SVG de 490 à 2 650 caractères) ; aucune de ses valeurs n'est reprise.

## 1. Le geste 1 aujourd'hui : un tampon posé reste-t-il sur la copie ?

| Cas | Écran (et PDF, même résolveur) | Rétroaction écrite |
|---|---|---|
| Intégré renommé, posé | peint | « Observations », son nom, son texte |
| … puis retiré de la palette | **peint** | son nom ; **le texte fourni revient à la place du sien** |
| … rechargé | peint | idem |
| Tampon créé, posé | peint | « Observations », son nom, son texte |
| … puis supprimé | peint (l'image est encore en mémoire) | « Autres tampons », son nom, **texte vide** |
| … rechargé | **plus rien** : le tampon est toujours dans l'annotation, mais il n'a plus d'image, et l'écran comme le PDF sautent un tampon sans image | « Autres tampons », son nom, texte vide |

**Cause du texte perdu** (lu) : `enregistrerRetroObservations` reconstruit `retroactionsObservations` à partir des seuls champs affichés ; un tampon retiré n'est plus affiché.
**Cause du tampon invisible** (lu) : `appliquerPersonnalisations` ne charge les images que des tampons du catalogue ; supprimé, le tampon créé n'y est plus.

## 2. Le stock : ce qui reste en base d'un tampon créé supprimé

| Donnée | Reste ? |
|---|---|
| Sa définition (`tamponsPersonnalises`) | **non** |
| Son nom et son image (`personnalisationObservations`) | oui |
| Sa catégorie | **non** (elle ne vivait que dans la définition) |
| Son texte (`retroactionsObservations`) | **non** |
| Les tampons posés (annotations) | oui, intacts |

On peut donc lui rendre son nom et son image, pas sa catégorie ni son texte. Pour un intégré retiré, rien ne se perd en base sauf son texte (et le code garde la définition).

## 3. Le geste 3 aujourd'hui : gardé, retiré, puis « Utiliser dans ma palette »

- **Tampon créé** : il revient dans la palette, avec son nom et son image ; **sans son texte** (l'entrée de la bibliothèque ne garde pas le texte).
- **Intégré** : **il ne revient pas** dans la palette (son `id` reste dans `elementsMasques`), et son `id` s'écrit dans `tamponsPersonnalises`, où un intégré n'a rien à faire. Son texte revient au texte fourni.

## 4. Le verrouillage aujourd'hui

- Une copie **verrouillée** suit le nouveau nom, la nouvelle image et le nouveau texte d'un tampon, et le nouveau nom d'un code (mesuré). La couleur d'un code dessiné est celle enregistrée sur la forme (lu).
- L'évaluation verrouillée enregistre la note, la rétroaction écrite et les critères, **aucune annotation ni définition de tampon ou de code** (mesuré : ses champs ; lu : `_construireObjetEvaluationSauv`, `js/evaluation-sauvegarde.js:247-275`).
- La « note remise » du 27 oct. est une lecture de la note enregistrée, pas un instantané (lu).
- **Inférence de Cowork confirmée** : une copie annotée avant ses reprises d'intégrés afficherait déjà le nouveau nom, la nouvelle image et le nouveau texte.

## 5. Ce qui voyage (lu)

| Clé | Codex | Réserve | Export des tampons |
|---|---|---|---|
| `personnalisationObservations`, `retroactionsObservations`, `tamponsPersonnalises`, `bibliothequeTampons` | oui (toutes les clés) | **non** | oui (sauf `bibliothequeTampons`, qui a son propre export) |
| `elementsMasques`, `categoriesMasquees`, couleurs, ordre | oui, mais la valeur du poste est gardée à la fusion | non | en partie ; l'import **efface** les masques |
| Les évaluations | oui | oui | — |

Conséquence : une archive de la Réserve rouverte ailleurs montre ses copies verrouillées avec les tampons du poste qui l'ouvre. Le figé du plan, rangé dans l'évaluation, voyage avec elle.

## 6. Dispositions des trouvailles

| Trouvaille | Disposition |
|---|---|
| Le texte d'un tampon retiré revient au texte fourni | **Plan, lot 1** |
| Un tampon créé supprimé devient invisible après rechargement, à l'écran et au PDF | **Plan, lot 1** (la source) et **lot 4** (le stock) |
| « Utiliser dans ma palette » ne rend pas un intégré, et l'écrit dans `tamponsPersonnalises` | **Plan, lot 2** |
| L'entrée de la bibliothèque ne garde pas le texte ; `tamponsImages` écrit et jamais lu (#1166) | **Plan, lot 2** (la bibliothèque lit le catalogue) |
| Une copie verrouillée suit les réglages actuels | **Plan, lot 3** |
| La Réserve lit `tamponsPersonnalises` (`js/reserve-ouvrir.js:272-301`, `:1197-1220`) sans jamais l'enregistrer | **Commenter et oublier** : chemin mort pour les archives récentes, sans conséquence observable ; le figé du lot 3 rend la question sans objet pour les copies verrouillées |
| L'import des tampons remplace les clés et efface les masques (lu, non mesuré) | **Plan, lot 1** (à mesurer avant de toucher) |

## 7. Ce qui remonte à Grégoire

Les quatre questions fermées du plan, § 8 : ses copies déjà verrouillées (figer avec ce qu'elles montrent, ou rendre le sens fourni avant une date qu'il donne, ou ne rien figer d'office) ; le re-verrouillage ; les tampons créés supprimés avant cette version ; « Réinitialiser ». Les lots 1 à 3 peuvent partir sans ses réponses, pas le lot 4. Les mots des écrans (§ 6 du plan) sont à lui soumettre.
