# Verdict de relecture – Les bibliothèques en deux colonnes, lot 2 : les échelles et les cartouches (#1155)

> Cowork, dimanche 25 octobre 2026, 12 h 40 (Toronto). Relu sur la branche `bibliotheques-deux-colonnes` = `115747e1` : `DEMANDE-RELECTURE-2026-10-25-bibliotheques-deux-colonnes-2.md`, la consigne du lot 2 et le verdict du lot 1 ; dans le code, `BibliothequeUI.lieeAExemplaire` (`js/bibliotheque-ui.js`), les rangées des deux colonnes de `preparerDonneesBibliothequeCartouches` (`js/cartouches.js`, dont la cartouche retirée), `supprimerCartoucheConfirm` (chemin 2 de #647), la bulle `import-trimestre-tout-echelles` (`js/accompagnement-contenu-hover.js` l. 458) ; une capture (cartouches, Mac 1 440 clair, aperçu et ⋮ ouverts).
> **Méthode** : lecture du diff et du code, et **un tri de toutes les lignes du diff qui écrivent des données** (`git show 115747e1 -- js/echelles.js js/cartouches.js js/grilles.js js/bibliotheque-ui.js | grep -E "db\.(set|modifier|remove)|retirer.*DeLaBibliotheque|ajouter.*ALaBibliotheque|importer.*DansBibliotheque|dansBibliotheque\s*="`). Seules écritures changées : le retrait de `retirerEchelleDeLaBibliotheque` et de `retirerCartoucheDeLaBibliotheque` dans les deux « Supprimer définitivement » (décidé), et `garderEchelleDansBibliotheque`, qui appelle l'écriture existante du geste groupé. **Pas relancé par Cowork** : Vitest, WebKit.

## Verdict : **accepté**

Les deux fenêtres sont celles de la maquette, les gestes d'avant y sont tous, et la relation unique (`lieeAExemplaire`) ferme l'écart du lot 1 pour les trois fenêtres. Le break-test resté vert, puis complété, est le bon réflexe.

## 1. Les écarts et décisions de Claude Code

| Écart ou décision | Cowork |
|---|---|
| 1. « Importer depuis un autre trimestre » au pied de « Dans ta bibliothèque » pour les échelles | **Accepté** : la ligne est là où l'import écrit. Que les échelles importent dans la bibliothèque, quand les grilles et les cartouches importent dans le trimestre, est un comportement d'avant le lot : **commenter et oublier** (aucun symptôme vécu ; les mots de la bulle vont le dire, § 2). |
| 2. La marque « (gabarit) » partie | **Accepté**, comme au lot 1. |
| 3. Les cartouches retirées dans « Dans ta bibliothèque », « Retirée de ce trimestre » | **Accepté** : aucune ne devient introuvable par ce lot. Leur vraie place sera tranchée avec #1160, pour les trois fenêtres à la fois. Le mot neuf est soumis à Grégoire (§ 2). |
| 4. « Filtrer par grille » sans étiquette visible | **Accepté** : il ressemble au menu des dossiers, et son nom accessible demeure. |
| 5. Quatre options du composant, `lieeAExemplaire`, `choisirGroupe` | **Accepté** : les grilles reçoivent la même chose. |
| 6. Les fonctions sans lecteur retirées | **Accepté** (zéro dette). |
| 7. La complexité de `supprimerOuRemplacerEchelle` (22 → 23) | **Accepté**. |
| Supposition : le compte des cartouches ne retient que les commentaires rédigés | **Accepté** : le nombre affiché dit ce que l'élève pourra lire. |
| L'extension de « Supprimer définitivement garde l'exemplaire » aux échelles et aux cartouches | Décidée par Cowork dans la consigne du lot 2, pour les motifs que Grégoire a acceptés pour les grilles (8 h 22). Elle emporte moins qu'avant : rien ne s'efface de plus. |

## 2. Ce qui va à Grégoire (des mots qu'il lit)

1. **« Retirée de ce trimestre »**, la ligne d'une cartouche retirée. Cowork recommande de la garder : elle dit vrai, et « ← Utiliser dans ce trimestre », à côté, la ramène.
2. **La bulle de « Tout importer » des échelles** (texte relu par Grégoire le 15 oct.) dit « Copie toutes les échelles de ce trimestre dans ton trimestre actif. Les originales restent intactes. » C'est faux, avant comme après le lot. Cowork propose : **« Copie toutes les échelles de ce trimestre dans ta bibliothèque. Les originales restent intactes. »**

Les réponses de Grégoire entrent dans la consigne du lot 3 (une ligne à changer, s'il accepte).

## 3. Les trouvailles

| Trouvaille | Cowork |
|---|---|
| #1163, « Garder une cartouche dans ma bibliothèque » | **D'accord : inscrite.** À la fusion, le compteur de la branche (#1163) se rejoint à celui de `main` (#1162) : la ligne « Dernier ID utilisé » prend le plus grand, aucun numéro ne resert. |
| « Tout garder » verse un second exemplaire d'une échelle ramenée | **D'accord : rattachée à #1161.** |
| Une échelle retirée et absente de la bibliothèque devient introuvable | **D'accord : rattachée à #1160.** |
| La suppression d'une cartouche depuis l'écran (chemin 2) dit « Elle reste dans la Bibliothèque. » et lit la relation par l'`id` seul | **Tranché par Cowork : à aligner au lot 3.** C'est la même suppression ; elle n'efface pas l'exemplaire (mesuré, `supprimerCartoucheConfirm` n'écrit que l'ancrage), donc la phrase validée par Grégoire y est vraie. Elle prend « Son exemplaire de ta bibliothèque reste. » et `lieeAExemplaire`, aux mêmes conditions que la fenêtre. Une ligne au plan, sous « Inscrit en chemin ». |
| Le bandeau des doublons nomme la copie et son exemplaire | **D'accord : commenter et oublier.** |
| Le commentaire périmé de `ajouterCartoucheALaBibliotheque` | **D'accord**, porté par #1163. |

## 4. À faire, dans le prochain commit de la branche

- Ce verdict (il est sur le Mac, hors de la branche).
- La ligne du lot 2 au plan : « codé, relu, accepté » avec `115747e1`.
- Sous « Inscrit en chemin » : le chemin 2 de la suppression d'une cartouche (§ 3).

## 5. Portes terrain

Aucune pour ce lot : il ne part pas en ligne. La porte iPad et Safari reste due à la fin du lot 3, avant la mise en ligne groupée (verdict du lot 1, § 3).
