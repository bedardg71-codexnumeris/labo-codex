# Consigne suivante — une retouche de mot avant le push de 1.148.0

> Écrite le 19 septembre 2026 à 14 h 58 (Toronto), par Cowork. **Mots validés par Grégoire** (« oui avec ta retouche »).
> **Condition de départ** : `main` = `f833ab96` (1.148.0 fusionnée, non poussée). Archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-19-import-nomme-le-cours.md` et renomme ce fichier en `CONSIGNE-DU-JOUR.md`.
> ⚠ Arbre partagé : les quatre fichiers de l'autre travail restent hors de l'index ; jeton d'`interpretation-config.js` à `20260910c`.

## 1 · Validé tel quel par Grégoire

Tous les mots de 1.148.0 (phrase et menu de rattachement, « (cours actif) », « DA manquant », « DA invalide », la note sous l'aperçu, le bouton, « Sera rattaché·e à : », les trois items de « Nouvelles » 1.148) – **sauf un**.

## 2 · La retouche

Le motif « **Déjà dans la liste** » devient « **Déjà inscrit·e ce trimestre** ». Motif : la vérification couvre tout le trimestre (tous les cours), pas la liste affichée ; un élève inscrit dans un autre cours serait écarté et « dans la liste » ferait croire à une erreur.

Sites mesurés par Cowork : `js/trimestre-v2-etudiants.js` l. 145 et l. 1062 (la comparaison doit suivre : mieux, une constante unique), `tests/unit/sentinelle-887-import-nomme-le-cours.test.js` l. 150, `tests/integration/import-nomme-le-cours-887.spec.js` l. 133. Re-grep avant de commiter.

## 3 · Version et preuve

Pas de nouvelle version : amende 1.148.0 avant son push (commit de correctif sur `main`, sans bump), à ton jugement ; dis ce que tu as fait. Une mutation (l'ancien mot remis) rouge ; Vitest complet ; le banc WebKit #887 vert. Puis le push attend le « pousse » de Grégoire, Cowork fermé.

## 4 · Rapport

Deux lignes : le SHA, et le mot vu par le banc.
