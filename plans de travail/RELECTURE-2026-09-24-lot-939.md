# Relecture croisée – lot #939 (1.156.3)

> Écrite le 24 septembre 2026 (Toronto), par Cowork, sur `lot-939-commentaire-critere` = `d08a8680`.

## 1 · Verdict : VERT, aucune correction

Faite sur une copie `git archive` de `d08a8680`, hors du dépôt.

- `sentinelle-939-…` (13), `mesure-ce-que-l-eleve-lit-2026-09-06` (9), `sentinelle-757-…` (2), `sentinelle-764-…` (3), `sentinelle-lot3-analytique-niveau` (43) : 70 / 70 verts.
- **Sept mutations de Cowork, sept rouges** : M1 la cartouche passe avant le commentaire enregistré (6) · M2 « [Non défini] » accepté comme commentaire (4) · M3 le commentaire enregistré survit à un changement de niveau (1) · M4 une évaluation d'un autre élève lue (1) · M5 le repli sans identifiant retiré (1) · M6 le texte copié ignore le commentaire de l'écran (3) · M7 une évaluation remplacée lue par le repli (1).
- Lu : une seule cascade (`commentaireDuCritere`), lue par le PDF, le texte copié et l'écran ; l'anonymisation reste à l'appelant qui imprime (inchangée) ; aucune donnée réécrite (« [Non défini] » en base est reconnu à la lecture).
- **Non refait par Cowork** : la spec WebKit. Ton vert fait foi.

## 2 · Une remarque, issue 3 (commenter, sans suite)

Une reprise naît d'un `structuredClone` de l'originale (`evaluation-jetons.js` ≈ l. 548 : « les scores de l'originale sont conservés ») : elle porte donc les commentaires enregistrés de l'originale. Avec #939, rouvrir la reprise au même niveau garde ce commentaire ; changer le niveau prend la cartouche. C'est la règle de Grégoire appliquée à ce que la reprise porte ; rien à corriger.

## 3 · Avant la fusion

L'arbre de `main` porte encore, non commités, `plans de travail/CONSIGNE-DU-JOUR.md` (modifié) et `_ancienne-CONSIGNE-DU-JOUR-2026-09-24-lot-760-759-observations.md` (non suivi), identiques à ceux de la branche : écrits par Cowork, qui ne peut ni les effacer ni toucher l'index. Remets `CONSIGNE-DU-JOUR.md` à l'état de `main` et retire l'archive non suivie (la branche porte les deux), puis fusionne, verdict, push.
