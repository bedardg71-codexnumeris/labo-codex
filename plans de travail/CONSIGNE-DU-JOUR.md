# Consigne – lot court #959 : une évaluation ouverte depuis sa copie garde son statut d'intégrité (et tout ce qu'elle porte) quand on l'enregistre

> Écrite le 26 septembre 2026, vers 15 h 32 (Toronto), par Cowork, pendant que le lot A était en fusion (branche `lot-a-anonymisation-enregistre` encore active dans l'arbre de travail). **Ne commence qu'une fois 1.160.0 poussée et verte.** Écrite sous ce nom, et non dans `CONSIGNE-DU-JOUR.md`, pour ne pas toucher un fichier suivi pendant ta fusion : au début du lot, archive l'actuelle `CONSIGNE-DU-JOUR.md` (lot A) sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-26-lot-A-anonymisation.md` et renomme celle-ci en `CONSIGNE-DU-JOUR.md`. À remesurer avant tout code (lignes lues sur la branche du lot A).
> **Tranché par Cowork** (addendum de la relecture du lot A) : lot court juste après le lot A, avant le Lot B, sur le modèle de #957. Grégoire ne veut pas qu'on mesure ses données réelles pour ce défaut (26 sept.) : **aucune mesure du stock**.

## 1 · Le constat (#959, le tien, `[exécuté]` en mode normal)

Une évaluation « IA » (ou « plagiat ») ouverte depuis sa copie, puis enregistrée (`sauvegarderEvaluationModifiee`, `js/evaluation.js` ≈ l. 1835), repasse à « recevable » et perd ses notes d'intégrité. Cause lue : seul `modifierEvaluation` (Liste des évaluations, ≈ l. 1037) appelle `_chargerStatutsEtBadgesModif` (≈ l. 1375, appel l. 1132) ; le chemin de la copie ne l'appelle pas, et `_lireChampsDOMMod` (≈ l. 1704) relit l'écran resté à ses valeurs par défaut.

## 2 · Ce que Cowork a lu en plus (non exécuté) : le défaut est probablement plus large que l'intégrité

`_chargerStatutsEtBadgesModif` restaure aussi le **statut de remise** (`remiseProduction1`), les **points** par critère (`eval_pts_…`) et les **catégories d'erreurs** (`eval_categories_…`), entre autres. Si le chemin de la copie ne les charge pas et que `_lireChampsDOMMod` les relit, ils se perdent de la même façon.

## 3 · Ce qui est attendu

1. **Mesure d'abord, au navigateur** : pour CHAQUE champ que `_lireChampsDOMMod` relit, une évaluation qui porte une valeur non par défaut, ouverte depuis la copie puis enregistrée, la garde-t-elle ? Fais-en la liste (champ, gardé / perdu).
2. **Un seul chargeur pour les deux chemins.** Le chemin de la copie restaure l'évaluation par la même fonction que « Modifier » dans la Liste (pas une copie de ses lignes). Si l'ordre d'appel ou le contexte du chemin de la copie l'empêche, dis pourquoi en une ligne, et choisis le remède qui ferme TOUS les champs perdus du § 3.1.
3. **Anonymisation** : les notes d'intégrité sont masquées en anonymisation depuis le lot A (`poserChampTexteLibre`) ; vérifie que le chargeur partagé garde ce comportement, et qu'un enregistrement en anonymisation réécrit la note en base, telle quelle.
4. **Ne change rien à l'interface ni aux mots** : l'harmonisation de l'évaluation (D1, « Verrouiller l'évaluation », « Non verrouillée ») est le Lot C.

**Stock** : une évaluation déjà remise à « recevable » par ce chemin ne retrouve pas son statut ; rien n'est réécrit. **Rien n'est effacé.**

## 4 · Preuves

- Banc WebKit sur le trajet de la copie (celui des specs #699 / #882) : pour chaque champ perdu au § 3.1, rouge avant, vert après. Un cas témoin par la Liste (vert avant et après).
- Un cas en anonymisation pour les notes d'intégrité.
- Mutation : retirer l'appel au chargeur dans le chemin de la copie → rouge.
- Suite complète Vitest.

## 5 · Livraison

- **Relecture croisée de Cowork obligatoire** (notes d'élèves, intégrité académique). `DEMANDE-RELECTURE-2026-09-26-lot-959.md`, puis l'ordre du `PROTOCOLE.md`.
- Correctif (patch).
- **Nouvelles, proposition de Cowork, à soumettre à Grégoire avant le push** (à ajuster aux champs réellement perdus) : « Évaluer : une évaluation ouverte depuis la copie garde son statut d'intégrité et ses notes quand tu l'enregistres. »
- Fin de lot : cocher #959 ; `FILE-DES-LOTS.md` à jour.
