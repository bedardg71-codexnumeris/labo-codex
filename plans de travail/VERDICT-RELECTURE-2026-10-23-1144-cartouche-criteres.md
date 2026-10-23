# Verdict de relecture – #1144 : la cartouche qui remplaçait les critères de la grille

> Cowork, vendredi 23 octobre 2026, 13 h 58 (Toronto, mesuré par `date`). Relu : `f39be1bc` et `e088aa6c` (non poussés), la demande `DEMANDE-RELECTURE-2026-10-23-1144-cartouche-criteres.md` et le rapport de Claude Code (13 h 55). Mesures dans les données de Grégoire : Chrome, origine de l'application, lecture seule d'IndexedDB depuis `version.json` (l’application n’a pas été chargée), 13 h 55 à 13 h 58.

## Verdict : accepté, prêt pour la release

- **L'écran.** `cartoucheSelectionnee` parcourt `grille.criteres` ; les commentaires se lisent par id. L'avis passe par `textContent`. Le texte de l'avis (« La cartouche n’a pas de commentaires pour « X ». Ce critère s’évalue quand même. ») est **accepté par Cowork** : il est lu par l'enseignant, pas par l'élève.
- **La liberté prise** (écrasement possible → listée sans proposition) : acceptée, c'est le choix prudent.
- **Jetons anti-cache** : les deux modules neufs et les trois fichiers touchés portent un jeton neuf dans `index.html`.
- **Console** : rien n'est écrit sans `{ reparer: true }` (l. 143) ; Codex à jour exigé ; A2025 et H2026 refusés. Sur les données mesurées le 23 oct. à 13 h 20, la liste attendue compte exactement deux cartouches.

## Les deux mesures demandées (§ 2 de la demande)

- **(a)** Aucune des deux cartouches ne porte `idOriginal`, `dateImport` ni `inspireDeTrimestre`. Clés présentes : `id, nom, grilleId, echelleId, verrouille, dansBibliotheque, metadata_cc, dateModification, metadata` (et une clé masquée par l'outil). `metadata_cc` : auteur Grégoire, `date_creation` 2026-08-24. **Ce n'est donc pas le chemin 2 de l'import d'un autre trimestre.**
- **(b)** `G5H.inspireDe` = `"GRILLE_1782504228322_1_6398d555452d"` (une chaîne : la grille G5H de l'H26) ; `G5M.inspireDe.sourceId` = `GRILLE_1782504228333_f_db90dd7b3554` (« Grille-5 FR-ALGO H26 », 24 août). **Aucune ne pointe G4H ni une grille absente.**

## Deux faits nouveaux, et deux mécanismes distincts

1. **« Plan de rédaction (refonte A26) » existe deux fois, avec le même id** (`CART_1787608995681_2_e95ea44399c7`) : sous la clé de la grille absente `GRILLE_1787608995679_1_8f192e2b5974`, nommée « Plan de rédaction A26 », `grilleId` = cette grille, modifiée le 24 août à 23:46Z ; et sous G5H, nommée « (refonte A26) », `grilleId` = G5H, modifiée le 30 sept. à 20:12Z. Mêmes critères (ceux de G4H). ⮕ **Un geste a ÉCRIT la cartouche dans la clé d'une autre grille, id gardé, `grilleId` changé, critères non remappés, et sans la retirer de la source.** Piste à lire : un enregistrement depuis l'éditeur de cartouches après un « recalage » du `grilleId` (la demande dit que `chargerMatriceRetroaction` recalait le `grilleId` à l'ouverture).
2. **« Rédaction (refonte A26) » n'existe qu'une fois, sous G5M, et ce n'est pas elle qui a bougé : c'est la grille.** Les quatre premiers critères de G5M portent des ids `CR_1788393046427_2…`, `…059277_3…`, `…068727_4…`, `…079610_5…` : quatre créations à 10-13 s d'intervalle, vers le 2 sept. au soir. Français écrit garde l'ancien id (`CR1759529555936`), partagé avec la cartouche. ⮕ **Les critères d'une grille ont été remplacés (supprimés puis recréés, ou régénérés) APRÈS que la cartouche eut été faite**, et la cartouche a gardé les anciens ids.

**Disposition : inscrire et continuer** (issue 2, déjà le choix de la demande). L'écran ne ment plus, quelle que soit la source, et la console répare le stock. Ces deux faits vont dans #1144 de `SUIVI-BUGS.md` (prochaine consigne).

## Une trouvaille, troisième issue

Un critère de grille sans pondération numérique (`null`) s'afficherait « (null %) » dans `cartoucheSelectionnee`, comme avant ce lot (l'ancien code lisait déjà `critereGrille.ponderation`). Dans ses données : un seul critère, « Qualité de la langue » de « Grille d'évaluation – Renforcement en Français (textes 1 et 2) », grille sans cartouche. Sans conséquence observable aujourd'hui : **commenter et oublier.**

## Ensuite

La release (patch, 1.216.1) avec un troisième item dans les Nouvelles 1.216, après validation du texte par Grégoire ; puis le verdict complet et le push, à son signal.
