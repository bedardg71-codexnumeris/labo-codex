# Verdict de relecture – Les bibliothèques en deux colonnes, lot 3 : les productions et les pratiques (#1156)

> Cowork, dimanche 25 octobre 2026, 16 h 20 (Toronto). Relu sur la branche `bibliotheques-deux-colonnes` = `1c854369` (documents : `c4ac6d13`) : `DEMANDE-RELECTURE-2026-10-25-bibliotheques-deux-colonnes-3.md` en entier ; le rapport relayé par Grégoire ; deux captures (pratiques, Mac 1 440 clair, ⋮ ouvert ; productions, iPad 820 clair, aperçu ouvert).
> **Méthode** : lecture, et **un tri de toutes les lignes du diff qui écrivent des données** (`git show 1c854369 -- js/ | grep -nE "^[+-].*(db\.(set|setSync|modifier|remove)|modifierEtAnnoncer|retirer[A-Za-z]*DeLaBibliotheque|ajouter[A-Za-z]*ALaBibliotheque|importer[A-Za-z]*DansBibliotheque|dansBibliotheque\s*=)"`). Seules écritures changées : le retrait de `retirerDeLaBibliotheque` dans `supprimerProductionDefinitivement` (décidé) et `garderProductionDansBibliotheque`, qui appelle l'écriture existante du geste groupé. Les aides retirées n'ont plus d'appelant (`git grep` : `repertoires.genererZone`, `renderLigneDossierSelect`, `genererSectionHTML(` → 0). **Pas relancé par Cowork** : Vitest, WebKit.

## Verdict : **accepté, avec une retouche** (§ 2)

Les deux fenêtres sont celles de la maquette ; la règle « aucun geste perdu » tient (« Exporter (JSON) » gardé, la note des maquettes gardée) ; le break-test resté vert, puis renforcé (#326, `sites: 2`), est le bon réflexe.

## 1. Les écarts et décisions de Claude Code

| Écart ou décision | Cowork |
|---|---|
| 1. Les trois aides devenues orphelines, retirées | **Accepté** : c'est ce lot qui les rendait orphelines (le test « est-ce que je viens de l'écrire ? »). Mesuré : zéro appelant. |
| 2. `genererBadgeSourcePratique`, `genererIdCourtPratique` retirées | **Accepté.** |
| 3. La note des maquettes (#326) gardée, en classes | **Accepté** : un geste d'aujourd'hui. |
| 4. « ← Utiliser » des pratiques laisse la fenêtre ouverte | **Accepté** : la règle du lot 1. |
| 5. `selectOnChange`, `selectSecond` | **Accepté.** |
| 6. La famille lue sur le code du registre | **Accepté**, mais le libellé de DEN est faux : § 2.1. |
| 7. `FAMILLES_TAXONOMIQUES` | **Accepté** ; c'est là que se corrige DEN (§ 2.1). |
| La phrase d'après l'import JSON | **Accepté** : le lot la rendait fausse. |
| Les libellés de l'aperçu (« Objectif : », « Grille de critères d'évaluation », « Échelle de performance », « Cartouche de rétroaction ») | **Accepté** : ce sont des libellés existants, les mêmes dans les deux fenêtres. |
| « Retirée de ce trimestre » sur une production | **Accepté** : décision de Grégoire du 25 oct., 12 h 40, appliquée comme la consigne le prévoyait. |
| La bulle des productions | **Accepté** : la mesure confirme que l'import écrit dans la bibliothèque. |

## 2. La retouche

### 2.1 DEN se dit « PAN-Dénotation » (l'erreur venait de la consigne)

La consigne citait « Dénombrement », pris dans la table taxonomique. **C'était une entrée périmée.** Mesuré : « dénotation » 84 fois dans `js/` et `index.html`, « dénombrement » une seule fois, dans cette table ; le type canonique est `denotation` (`comparateur-pratiques.js` l. 316, `pratiques-bibliotheque.js` l. 41) ; l'éditeur dit « PAN – Dénotation » (`pratiques-gestion.js` l. ~191). Ce n'est pas une question à Grégoire : c'est le nom que l'application donne déjà à cette famille.

1. Dans `FAMILLES_TAXONOMIQUES`, la famille DEN (code `denotation`, et l'ancien `denombrement` qui y mène) prend le nom **« PAN-Dénotation »**, au patron de « PAN-Standards » et « PAN-Spécifications », et le résumé du texte existant de l'éditeur (l. ~191 : « note finale certificative posée (non calculée) selon l'atteinte de cibles d'apprentissage… »), sans parenthèse anglaise s'il n'y en a pas d'existante. **Aucun mot neuf** : s'il en faut un, dis-le dans la demande.
2. Comme `obtenirDescriptionCourtePratique` recompose cette table, l'éditeur de pratique (l. ~1225, ~1498, ~1556) dira la même chose. Vérifie ce qu'il affichait avant pour une pratique DEN de la démo (« Modèle de base ») : le type brut, « denotation », ou « Dénombrement… ». Dis-le dans la demande.
3. Preuve : le banc 1156 lit « PAN-Dénotation » sur « Modèle de base » ; break-test.

### 2.2 La phrase de colonne vide nomme le bouton, comme les trois autres fenêtres

« …, ou crée-la à l'écran. » devient **« …, ou crée-la avec « + Nouvelle production ». »** et **« …, ou crée-la avec « + Nouvelle pratique ». »** : le patron des grilles, des échelles et des cartouches (`grilles.js` l. ~2439, `echelles.js` l. ~1146, `cartouches.js` l. ~3954). Les deux libellés sont mesurés : ce sont ceux de la rangée de sélection (`tests/integration/bibliotheques-menu-1147.spec.js`, `libelleNouveau`).

### 2.3 Rendre la copie de travail à `main`, et le relais

La version du soir de `main` attend le signal de Grégoire (le Cadre, le profil individuel, les chaînes d'étapes, la présentation du critère algorithmique, le statut « Incomplet »). Elle ne peut pas partir d'une copie de travail restée sur la branche.

1. Après le commit de la retouche, **ramène la copie de travail sur `main`**.
2. **Les documents de Cowork non commités** (trois modifiés, trois nouveaux, selon ton rapport) : nomme-les dans la demande. Ceux qui parlent de `main` se commitent sur `main`, dans un commit de docs seul, fichiers nommés ; ceux du chantier des bibliothèques, sur la branche. En cas de doute sur un fichier, laisse-le et nomme-le.
3. **`RELAIS.md`** (règle de relais du 8 août) : sur `main`, dans ce même commit de docs, l'état de la branche : son SHA, les lots 1 à 3 relus et acceptés, le lot 4 à venir, la fusion prévue après le lot 4. **Pas de push** : Grégoire pousse.

## 3. Les trouvailles

| Trouvaille | Cowork |
|---|---|
| #1164, « Garder une pratique dans ma bibliothèque » | **D'accord : inscrite.** |
| Une pratique retirée et absente de la bibliothèque est introuvable | **D'accord : rattachée à #1160.** Note pour #1160 : les grilles, les échelles et les pratiques retirées s'y perdent ; les cartouches et les productions retirées restent visibles dans « Dans ta bibliothèque ». La décision de leur place commune reviendra à Grégoire avec #1160. |
| « Tout garder » des productions, second exemplaire | **D'accord : rattachée à #1161** (lu, pas sondé, dit comme tel). |
| `ajouterProductionsABibliotheque` mort | **D'accord : commenter et oublier.** |
| Le type des pratiques de la démo sous `configuration.type` | **D'accord : commenter et oublier.** |

## 4. À faire dans le commit de la retouche

Ce verdict ; la ligne du lot 3 au plan (« codé, relu, accepté avec une retouche », `1c854369` et le SHA de la retouche). Une courte demande de relecture de la retouche : `DEMANDE-RELECTURE-<date>-bibliotheques-deux-colonnes-3-retouche.md`.

## 5. Portes terrain

Aucune pour ce lot. La porte iPad et Safari se fait après le lot 4, avant la mise en ligne groupée.
