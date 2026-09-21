# Consigne du jour – une note en ,5 monte toujours : 57,5 donne 58 (demies de l'export pour Léa, trouvaille de 1.152.2)

> Écrite le 21 septembre 2026, 13 h 08 (Toronto), par Cowork. **Proposée** tant que Grégoire ne l'a pas relayée.
> La précédente (F4-1, 1.152.4, poussée) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-21-f4-1-bilan-mots-eleve.md` (déplacée par Cowork, à commiter avec ce lot).
> **Décision de Grégoire** : lot ajouté à la file le 21 sept. à 11 h 43 (« oui, on l'ajoute ») ; lancé à 13 h 08 (« oui »). Règle : **la même que celle du niveau imprimé (1.150.0) : une note exactement en ,5 monte** (74,5 → 75, 57,5 → 58).

## 0 · Conditions de départ

`git --no-optional-locks log --oneline -1 origin/main` porte `d5b67d62` (journal de 1.152.4) ou un commit de journal après. Sinon, arrête-toi. Aucune autre session n'écrit dans `js/`.

## 1 · Ce que Cowork a mesuré (21 sept., à remesurer)

- `js/portfolio.js` : `simulerIndices` (≈ l. 844-845) et `calculerEtStockerIndicesCP` (≈ l. 733-734) font `P_decimal = noteFinale / 100` puis `Math.round(P_decimal * 100)`. Exécuté sous node : 14,5 → 14 ; 28,5 → 28 ; 56,5 → 56 ; 57,5 → 57 (`57.5/100*100 = 57.49999999999999`) ; 74,5 → 75 et 59,5 → 60 sont justes.
- Le commentaire l. ≈ 843 dit « Mêmes arrondis que calculerEtStockerIndicesCP » : **les deux sites doivent rester identiques.**
- ⚠ **Le lot dépasse l'export pour Léa** : `simulerIndices` est lu par le profil (`profil-etudiant-sections-affichage.js`), le Comparateur, l'assistant, `indices.js` et l'export des résultats finaux ; `calculerEtStockerIndicesCP` écrit l'indice P du trimestre en cours. Mesure la liste des lecteurs et dis-la au rapport.
- **C** passe par le même aller-retour (`Math.round(C_decimal * 100)`) : remesure s'il perd aussi des demies (un ratio remis ÷ attendus). Si oui, même correctif, même lot ; sinon, dis-le.

## 2 · Ce qui change

- Une seule façon d'arrondir, partagée par les deux sites, qui ne passe plus par l'aller-retour flottant (le choix technique est à toi ; nomme-le). Une note exactement en ,5 monte. Rien d'autre ne bouge : aucune note qui n'est pas en ,5 ne change.
- Si l'arrondi du niveau imprimé de 1.150.0 est une fonction réutilisable, réutilise-la ; sinon, dis pourquoi.
- **Aucun mot à l'écran ne change.** Pas de phrase de « Nouvelles » sans la proposer à Grégoire (à PROPOSER, question fermée).

## 3 · Stock – limite du 20 sept. : rien ne s'efface

- Un fichier déjà exporté ne se réécrit pas.
- L'indice P du trimestre en cours se recalcule à l'ouverture, comme avant : pour un élève dont la note est exactement à 14,5, 28,5, 56,5 ou 57,5, il monte d'un point. Mesure-le sur le pack démo (combien d'élèves, lesquels), dis-le. Les trimestres passés ne sont pas rouverts.
- ⚠ **Arrêt** : si une valeur corrigée **traverse 60** (59,5 compris) sur un chemin réel, arrête-toi et dis-le avant de commiter : ça touche une réussite, donc Grégoire. (Claude Code a mesuré « aucune ne traverse 60 » : à remesurer.)

## 4 · Preuves

- Sur le vrai moteur : les quatre demies (14,5 · 28,5 · 56,5 · 57,5) donnent 15, 29, 57, 58, au profil, à l'export et dans l'indice stocké ; 74,5 → 75 inchangé ; une note non demie (57,49 → 57, 57,51 → 58) inchangée.
- Une contre-épreuve sur TOUTES les valeurs à une décimale de 0 à 100 : l'entier rendu = l'arrondi « demi vers le haut » calculé en entiers (dixièmes). Pas seulement les quatre valeurs connues.
- Mutations, une à la fois, rouges : un seul des deux sites corrigé ; l'ancien aller-retour remis ; `Math.floor` ; demi vers le pair.
- Vitest complet vert. **Release : patch.** Relecture croisée par Cowork avant le verdict et le push ; push sur le mot de Grégoire.

## 5 · Ce que Grégoire verra

Pour un élève dont la note est exactement en ,5, l'export pour Léa, le profil et le Comparateur disent le même entier, arrondi vers le haut (57,5 → 58). Tous les autres élèves : rien ne change.

## 6 · Fichiers de Cowork à commiter avec ce lot

Cette consigne, l'archive de la précédente, `plans de travail/FILE-DES-LOTS.md` (retire-en le lot 1 une fois poussé ; le lot 2, les trois « artefact » du PDF, a été ajouté par Cowork à 13 h).
