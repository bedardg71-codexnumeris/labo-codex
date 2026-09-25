# Demande de relecture croisée – #946 (1.159.4)

> Écrite le 25 septembre 2026 (Toronto) par Claude Code. Branche `fix/946-cartouche-copie-evaluee` (arbre principal, non poussée) : `9ba02569` (correctif, banc et release), puis le commit de cette demande. Base : `aa5579e8`.
> Règle 2 de `PROTOCOLE.md` : une release qui touche ce qui s'écrit dans une évaluation. Verdict attendu dans `plans de travail/RELECTURE-2026-09-25-bug-946.md`.

## Ce que la mesure a montré sur `aa5579e8` (WebKit, exécuté)

Fixture fictive : la production `p946` prévoit `CT946R` ; la copie de TEST946 a été évaluée avec `CT946` (même grille) ; une autre copie a été évaluée avec une autre grille. `_modeleProductionPourEval` retombe donc sur la production. Le journal ci-dessous liste chaque valeur posée au menu Cartouche.

| Chemin | Menu à la fin | « Enregistrer » écrit | Journal du menu |
|---|---|---|---|
| Visionneuse (`evaluerProduction`, copie présente) | `CT946` | `CT946` | CT946 > **CT946R > CT946R** > CT946 > **CT946R** > CT946 |
| « Consulter » sans copie (`modifierEvaluationParId`) | **`CT946R`** | **`CT946R`** | CT946R > CT946 > **CT946R** |
| Menu « Production » (formulaire ouvert sur une autre production, puis `p946`) | **`CT946R`** | **`CT946R`** | CT946R > CT946 > **CT946R** |

Réponse au § 1 de la consigne, pour le second chargeur : `demarrerEvaluationDepuisFichier` atteint bien une copie évaluée (visionneuse, dès 150 ms). Il passe avant `modifierEvaluation`, qui rétablit la bonne cartouche vers 800 ms. Dans la visionneuse, le défaut était donc transitoire et sans écriture mesurée.

## Ce que le lot fait

- `_cartoucheModelePourLaCopie(etudiantDA, productionId, refModele)` renvoie `''` quand la copie a une évaluation enregistrée active (`_evaluationEnregistreeDeLaCopie`, celle de #939/#944). Sinon, il renvoie la cartouche du modèle.
- Les deux chargeurs passent par lui : `chargerProduction` (pose immédiate) et `demarrerEvaluationDepuisFichier` (boucle de huit essais).
- **Réapplication à +300 ms retirée** de `chargerProduction`. Le break-test M2 montre que c'était elle qui écrasait l'évaluation. Pour une copie sans évaluation, aucun essai ne rougit sans elle, y compris le chemin du menu « Production ».
- Aucune évaluation réécrite (stock assumé, voir la fiche).

## À cartographier avant de lire le patch

1. **Les poseurs de cartouche au menu** (ta liste de cinq chargeurs pour #944) : en reste-t-il un qui pose la cartouche du MODÈLE sans passer par `_cartoucheModelePourLaCopie` ? Je ne compte pas la restauration du cache de `travaux-ui.js` (vers la ligne 5165), qui pose la dernière cartouche mémorisée et non le modèle, et seulement si le menu est vide. Sur une copie évaluée **sans** `cartoucheId`, elle en poserait une. C'est une trouvaille que j'ai laissée hors du lot (issue 2 proposée, non inscrite) : dis-moi si tu la classes autrement.
2. **Le retrait des +300 ms** : la vraie question est s'il existe un chemin où un chargeur efface le menu APRÈS la pose immédiate, sur une copie sans évaluation. Le commentaire d'origine disait « au cas où le chargement l'écrase ». Je n'en ai trouvé aucun.

## Preuves

- `tests/integration/cartouche-copie-evaluee-fait-foi-946.spec.js` : 6 essais WebKit. Les chemins « Consulter » et menu « Production » sont rouges sur `aa5579e8` avec le symptôme exact. Le chemin visionneuse est rouge par son journal. Tous sont verts après le correctif.
- Bancs voisins verts en WebKit : `cartouche-changee-copie-evaluee-944`, `production-selects-echelle-cartouche`, `cartouches-dropdown-selection`, `cartouche-enregistrer-reste-ouverte` (14/14).
- Break-tests, tous rouges, fichier restauré par copie (même empreinte) :
  - M1, garde toujours fausse : 1 rouge (journal de la visionneuse) ;
  - M2, réapplication +300 ms remise : 3 rouges ;
  - M3, garde toujours vide : 2 rouges (les copies sans évaluation) ;
  - M4, visionneuse sans garde : 1 rouge.
- Vitest : 634 fichiers, 7364 essais verts, avant et après le commit du bump.

## Nouvelles

Le texte proposé par Cowork a été versé tel quel, **à valider par Grégoire avant le push** : « Évaluer : ouvrir une copie déjà évaluée garde la cartouche avec laquelle elle a été évaluée, même quand la production en prévoit une autre. »

## Ce que Grégoire verra

Quand il ouvre une de ses copies déjà évaluées par « Consulter » ou par le menu « Production », le menu Cartouche montre maintenant celle de l'évaluation. Jusqu'ici, il pouvait montrer celle que la production prévoit.
