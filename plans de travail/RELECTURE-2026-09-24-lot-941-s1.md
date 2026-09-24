# Relecture croisée – lot S1 de #941 (1.158.0)

> Écrite le 24 septembre 2026 (Toronto), par Cowork, sur `lot-941-s1-points-sans-echelle` = `9c69599a`.

## 1 · Verdict : VERT

Faite sur une copie `git archive` de `9c69599a`, hors du dépôt.

- Bancs `sentinelle-941-s1` (12), `lot3-analytique-niveau`, `940`, `939` : 90 / 90.
- **Mutations de Cowork** : M1 `every` → `some` dans `evaluationEnPoints` (une grille mixte lue en points) : rouge · M2 le niveau affiché pour une copie en points : rouge · M3 une grille mixte prise pour une grille en points : 2 rouges · M4 la garde `idModification` retirée de `_retirerEchelleDOffice` : **vert** – masquée par la garde suivante (`dejaEvaluee`, même élève, même production) ; redondance, pas un trou. Commenter, sans suite.
- Lu : la règle d'affichage vit dans `gabarits-utils.js` (`grilleEntierementEnPoints`, `evaluationEnPoints`, `niveauFinalAffichable`) et les lecteurs la lisent (les `estEnPoints` locaux ne sont que des relais) ; la présélection d'échelle reste intacte pour toute grille qui n'est pas entièrement en points (les grilles de Grégoire) ; `niveauFinal` reste calculé et écrit quand une échelle existe (bon réflexe : aucune note ne change au réenregistrement).
- **Non refait par Cowork** : les specs WebKit.

## 2 · Mots – validés par Grégoire (voir sa ligne)

La mention « Note provisoire — peut changer selon tes prochains travaux. » : les mots sont validés, mais **la condition** qui retire « et l'application de jetons » doit être celle de D5 – **la pratique ne déclare pas de jetons actifs** –, pas « la pratique est sommative » (une sommative peut déclarer des jetons, une autre famille peut n'en déclarer aucun). À faire dans S3, avec D5 : une seule règle pour le bloc « Jetons utilisés » et pour cette mention.
