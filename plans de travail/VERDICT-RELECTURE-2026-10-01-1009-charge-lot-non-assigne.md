# Verdict de relecture – #1009, la charge d'un lot dont les consignes ne sont pas marquées transmises (1.173.1)

> Rendu le 1er octobre 2026 à 8 h 56 (Toronto) par Cowork, sur le commit de release `e0fdb1dc` (branche `fix-1009-charge-lot-non-assigne`). Répond à `plans de travail/DEMANDE-RELECTURE-2026-10-01-1009-charge-lot-non-assigne.md`.

## Verdict : **vert par exécution, sans correction. Le lot part.**

## Ce que j'ai fait

- **Lu** le diff `f3a5405f..e0fdb1dc` hors Nouvelles : dans `js/rythme.js`, la garde de `estimerCharge` et l'export de la fonction ; le reste est la release (numéros).
- **Exécuté** sur un clone du dépôt à `e0fdb1dc`, installation à neuf côté Linux :
  - la sentinelle seule : 3 essais verts ;
  - **mutation 1**, posée par moi et vérifiée posée (la garde `entree.assignee === false` revient) : essai « le cas vécu » rouge, `expected [] to have a length of 1` ;
  - **mutation 2**, posée par moi et vérifiée posée (`estimerPourLot` ne rend plus `null` sur un lot vide) : essais 2 et 3 rouges ;
  - restauration par `git checkout -- js`, arbre propre, témoin vert ;
  - **Vitest complet : 669 fichiers, 7 884 essais verts**, code de sortie 0, 38 s.
- **Lu** la suite du trajet : `estimerPourLot`, `afficherPlanning`, `repartirDansJours`.

## Ce que je confirme

1. La cause est bien là où la demande la met, et le correctif est minimal. Un lot sans copie ni évaluation reste absent, par `estimerPourLot`, et la mutation 2 prouve que la sentinelle le tient.
2. Une échéance passée sur ce lot (ici le 29 septembre) n'ouvre pas de chemin neuf : la planification part d'aujourd'hui quelle que soit la plus ancienne remise, et `repartirDansJours` n'écarte que les plages antérieures à la remise. Un lot assigné en retard passait déjà par là. Lu, pas exécuté.
3. Aucun nom ni DA réel dans le banc (`daFictif`).

## Ce que je relève, sans bloquer

- **Le palier est la fonction, pas l'écran**, comme la demande le dit. La confirmation est à Grégoire, sur ses données, en 1.173.1 : sa production en cours apparaît à « Estimation de la charge » avec 6 évaluées et 20 restantes. Une rangée suffit ; pas d'artefact de porte pour un seul geste.
- **Sans entrée aux Nouvelles** : accepté. L'écran change (une ligne apparaît), aucun mot ne change ; précédent tenu (1.170.1, 1.170.2).
- **Trouvaille, issue 3 (commentée ici, rien à faire)** : dans `afficherPlanning`, `premierRemise && premierRemise > aujourdHui ? aujourdHui : aujourdHui` rend la même valeur des deux côtés. Antérieur au lot, sans effet.

## Pour la livraison

Le verdict au navigateur se prend Cowork fermé, le Mac branché (mesuré par Claude Code à 8 h 50 : sur batterie, 55 %). Grégoire dit « go » quand c'est fait. Ensuite : la consigne du jour de 8 h 51 (un codex ouvert sans assez d'espace finit par « Erreur »), en lot à part.

Fichiers de Cowork à commiter tels quels : ce verdict, `plans de travail/CONSIGNE-DU-JOUR.md`, `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-10-01-lot-I-bis-verification.md`.
