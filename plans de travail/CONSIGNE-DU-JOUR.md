# Consigne – lot court #960 : ouvrir une copie ne réécrit plus rien, et une rétroaction réécrite à la main reste la tienne

> Écrite le 26 septembre 2026, vers 16 h 39 (Toronto), par Cowork, pendant la fusion de #959 (branche `lot-959-statut-integrite` encore active). **Ne commence qu'une fois la version de #959 poussée et verte.** Écrite sous ce nom pour ne pas toucher un fichier suivi pendant ta fusion : au début du lot, archive l'actuelle `CONSIGNE-DU-JOUR.md` (#959) sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-26-lot-959.md` et renomme celle-ci en `CONSIGNE-DU-JOUR.md`. À remesurer avant tout code.
> Tranché par Cowork (relecture de #959, M1) : lot court avant le Lot B, cap « finir la rétroaction ». Grégoire ne veut pas qu'on mesure ses données réelles : **aucune mesure du stock**.

## 0 · La décision de Grégoire (26 sept., « garde vide »)

**Un commentaire de critère enregistré VIDE reste vide**, par les deux chemins : à l'ouverture par la copie, et à « Enregistrer » par la Liste. Il ne reçoit jamais le commentaire que la cartouche propose aujourd'hui. Motifs (proposés par Cowork, retenus) : la règle #939, « le commentaire enregistré fait foi » ; et le cas où il se remplirait est celui d'une cartouche qui a gagné un commentaire après l'évaluation – l'élève ne l'a jamais lu, il apparaîtrait dans son PDF sans décision de l'enseignant.
⮕ Ajoute-la à `plans de travail/DECISIONS-2026-09-26-enregistrement.md` comme **D6 · Un commentaire de critère enregistré vide reste vide**, avec ces mots.

## 1 · Le constat (#960, le tien, `[exécuté]`)

Par la copie (visionneuse, trajet `evaluerProduction` : chargeurs copie, copie, modifier), **la simple ouverture réécrit la base** : une rétroaction finale réécrite à la main est remplacée par le texte régénéré depuis les critères. Par la Liste (« Modifier »), l'ouverture n'écrit rien et « Enregistrer » garde la rétroaction. Identique avant et après #959. Banc : `tests/integration/evaluation-959-neutralite-chargeur.spec.js`, deux cas `test.fail` marqués #960.

## 2 · Ce qui est attendu

1. **Ouvrir une évaluation, par n'importe quel chemin, n'écrit rien.** Trouve ce qui écrit à l'ouverture sur le trajet de la copie (régénération de la rétroaction, enregistrement automatique déclenché par le chargement, autre) et ferme-le à la source ; dis en une ligne ce que c'était.
2. **La rétroaction finale enregistrée fait foi** à l'ouverture et à « Enregistrer », par les deux chemins : elle n'est jamais régénérée par le simple fait d'ouvrir ou d'enregistrer sans changement.
3. **D6** : un commentaire de critère enregistré vide reste vide, par les deux chemins.
4. **Mesure seulement, sans rien changer** : quand l'enseignant change un niveau APRÈS avoir réécrit la rétroaction finale à la main, que devient son texte ? Écris le résultat dans le rapport. C'est une autre question (la régénération voulue quand on change un critère), qui reviendra à Grégoire si elle pose problème.
5. **Ne change rien à l'interface ni aux mots** (Lot C pour l'évaluation).

**Stock** : une rétroaction déjà remplacée ne revient pas ; rien n'est réécrit. **Rien n'est effacé.**

## 3 · Preuves

- Les deux cas `test.fail` #960 deviennent des cas normaux, verts.
- Ouverture par la copie sans rien toucher : base identique à l'octet ; puis « Enregistrer » : rétroaction à la main gardée. Idem par la Liste (témoin).
- D6 : commentaire vide + cartouche qui porte un commentaire → vide après ouverture par la copie et après « Enregistrer » par la Liste ; rouge avant.
- Mutations : rétablir l'écriture à l'ouverture → rouge ; rétablir le remplissage d'un commentaire vide → rouge.
- Suite complète Vitest.

## 4 · Livraison

- **Relecture croisée de Cowork obligatoire** (rétroaction lue par les élèves). `DEMANDE-RELECTURE-2026-09-26-lot-960.md`, puis l'ordre du `PROTOCOLE.md`.
- Correctif (patch).
- **Nouvelles, proposition de Cowork, à soumettre à Grégoire avant le push** : « Évaluer : ouvrir une copie ne remplace plus ta rétroaction finale réécrite à la main, et un commentaire de critère laissé vide reste vide. »
- Fin de lot : cocher #960 ; `FILE-DES-LOTS.md` à jour.
