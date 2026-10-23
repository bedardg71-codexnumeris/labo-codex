# Retours de Grégoire – vendredi 23 octobre 2026, avant son cours

> Cowork, 6 h 57 (Toronto, mesuré par `date`). Constats faits avec Grégoire de 6 h 34 à 6 h 56, pendant la remise de l'Artefact 4. Ses données mesurées **en lecture seule** (Chrome, onglet sur `version.json` du même domaine : aucun code de l'application exécuté, rien d'écrit). Aucun nom d'élève ici : les copies sont désignées par leurs nombres ou leur identifiant. **À reprendre à son retour, dans cet ordre de priorité ; rien n'est encore confié à Claude Code.**
> ⚠ Le Chrome de Grégoire tournait encore en **1.214.0** à 6 h 34 (rapport de bogue), la 1.215.0 étant en ligne depuis la veille.

## 1. La phrase de Français écrit qui garde un ancien compte (vécu, PDF remis)

> ⚠ **PÉRIMÉ à 8 h 20 : diagnostic inversé.** C'est la ligne du calcul (`donneesAlgorithmiques`) qui est fausse, la phrase, le niveau et la note sont justes ; voir `CONSIGNE-DU-JOUR.md` (8 h 2x). Grégoire a dit à trois élèves que le bon compte était celui de la ligne du calcul : c'est l'inverse.

- Mesuré : 4 copies sur 24 de l'Artefact 4. La phrase enregistrée du critère (« Ta rédaction contient N erreurs… pour M mots ») contredit `donneesAlgorithmiques` : 2 au lieu de 1 (751 mots) ; 2 au lieu de 7 (1 800 mots, la copie non recevable) ; 12 au lieu de 3 (700 mots) ; 11 au lieu de 26 (893 mots). Le niveau n'a pas changé entre les deux comptes.
- Cause probable (lue dans le code, à confirmer) : à la réouverture, la règle #939 remet dans `comm_` le commentaire enregistré **au même niveau** ; pour un critère algorithmique, ce texte porte des nombres, et il écrase la phrase que le calcul vient de refaire (`evaluation-calcul.js` l. 898). Le PDF préfère ensuite l'enregistré à `retroAlgo` (`commentaireDuCritere`).
- Décision de Grégoire, 6 h 56 : les trois copies recevables sont remises telles quelles ; le bon compte est celui de la ligne du calcul. **À faire** : tarir la source, puis mesurer et proposer la réparation des 4 copies (écrire dans ses données lui revient), et refaire leurs PDF s'il le veut.

## 2. « Non recevable » ne met pas les critères à 0 (vécu)

- Mesuré : une seule copie non recevable au trimestre (IA, Artefact 4, `EVAL_1792590238071_6_9b6444440973`) : niveaux M, M, M, M, E ; note enregistrée 79,3 % ; le PDF dit « Maîtrisé ».
- Cause, lue dans le code : `evaluation-sauvegarde.js` l. 600 cherche `select[id^="critere"]`, alors que les menus s'appellent `eval_<id>` : rien n'est mis à 0 ni désactivé, depuis `c3e29b1b` (nov. 2025). Le message de l'écran promet l'inverse. Le PDF (`synthese-retroaction-*`) ne lit jamais `statutIntegrite`.
- **Revient à Grégoire** : ce que l'élève lit d'un travail non recevable (« aucune note », dit-il ; l'écran dit « critères à 0, exclue des moyennes »). Ce matin, il ne remet pas ce PDF.

## 3. L'affichage de la note : un réglage par copie, pas par groupe (vécu, au BACKLOG)

Le réglage « Affichage de la note dans la rétroaction » de la pratique ne change que les copies à venir ; chaque copie garde le sien (`optionsAffichage.affichageNote`). Les 24 copies étaient en « Niveau de performance » : Grégoire a dû déverrouiller, cocher, reverrouiller 24 fois. **Demande** : un geste qui vaut pour le groupe. À inscrire au BACKLOG.

## 4. Un commentaire enregistré vide (vécu, réglé à la main)

Une copie sur 24 (`EVAL_1792501466724_19_ed0ced2f73ca`) avait Structure enregistré vide le 20 oct. à 10 h 17, alors que la cartouche a un texte au niveau D ; le PDF le laisse vide (règle D6 du 26 sept.). Réglé par Grégoire (M, enregistrer, D, enregistrer). **Cause inconnue** : à chercher.

## 5. La poignée de redimensionnement qui fuit (rapport de bogue)

`Retours des testeurs/gregoire/BUG__grégoire__2026-10-23_06-34-06.txt` : dans Annoter › Évaluer, la poignée de la palette d'évaluation « fuit » le pointeur ; disparaît après Annoter puis Évaluer.

## 6. Chantier proposé par Grégoire : un bilan actionnable

**Sorti de cette session** (décision de Grégoire, 7 h 06) : il se fera dans une session dédiée. Tout ce qu'il a dit et montré est dans `CHANTIER-2026-10-23-bilan-actionnable.md`.
