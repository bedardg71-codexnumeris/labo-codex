# Relecture croisée – lot #942 (1.157.0)

> Écrite le 24 septembre 2026 (Toronto), par Cowork, sur `lot-942-lecon-manquee` = `c6525f7e`.

## 1 · Verdict : VERT, avec un complément de preuve

Faite sur une copie `git archive` de `c6525f7e`, hors du dépôt.

- `sentinelle-942-lecon-manquee` : 19 / 19.
- **Mutations de Cowork** : M1 la semaine ignorée (8 rouges) · M2 « Leçon sans titre » tu (1) · M3 le groupe comparé à l'identique (1) · **M4 le titre de la leçon posé dans `innerHTML` SANS `echapperHtml` : 19 / 19 VERT – aucun banc ne le voit.**
- Lu : une seule résolution date → leçon (`lecteurLeconsDuGroupe`, l'inverse de `dateDeLecon` sur le même `construireHoraireDeLecons`) ; « deux séances le même jour = une seule rencontre », comme l'Inspecteur ; le groupe résolu par la règle du PDF, maintenant normalisée (`normaliserNumeroGroupe`) – effet de bord voulu sur les échéances du PDF, dit dans ton rapport. Note, sans suite : `normaliserNumeroGroupe('')` = `'00000'`, donc un élève sans groupe coïncide avec un groupe-cours numéroté « 0 » ; déjà documenté dans `modes.js`, cas marginal.
- **Non refait par Cowork** : la spec WebKit.

## 2 · Le complément (tu viens de l'écrire : tu le finis)

Le titre d'une leçon est une donnée utilisateur – et une carte d'alignement peut venir d'un import. Ajoute un essai qui pose un titre porteur de HTML (`<img src=x onerror=…>`) et prouve qu'il sort échappé dans la pastille ; fais-le rougir sous M4. Pas de nouvelle relecture de Cowork pour ce seul essai.

## 3 · Ensuite

« Nouvelles » validée par Grégoire (voir sa ligne). Fusion, verdict, push – `main` porte aussi l'audit du parcours sommatif, qui part avec. Commite aussi `plans de travail/CONSIGNE-SOMMATIVE-FONCTIONNELLE.md` et `plans de travail/DECISIONS-2026-09-24-parcours-sommatif.md` (écrits par Cowork, à lire au prochain lot) et cette relecture.
