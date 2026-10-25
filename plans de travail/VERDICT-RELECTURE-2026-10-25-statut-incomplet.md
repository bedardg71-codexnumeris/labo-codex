# Verdict de relecture – le statut « Incomplet ; travail en cours »

> Cowork, dimanche 25 octobre 2026, 11 h 28 (Toronto). Relu : `62b14bd6` (`js/pratiques/`, `snapshots.js`, `profil-etudiant-sections-affichage.js`, `evaluation-sauvegarde.js`, `evaluation.js`, `index.html`, `styles.css`), la demande `DEMANDE-RELECTURE-2026-10-25-statut-incomplet.md`.

## Verdict : accepté, avec une retouche

- **Un champ à part (`travailEnCours`)** plutôt qu'une valeur de `statutRemise` : bien vu et bien justifié (l'application réécrit `statutRemise`).
- **La règle unique `evaluationCompteCommeRemise`** : vérifiée par Cowork, elle est équivalente à l'ancienne conjonction pour toute copie sans le statut (la remplacée et la non recevable sont toujours écartées en tête), et compte la copie incomplète comme remise. Cinq sites la lisent ; les sentinelles exigent désormais l'appel à la règle et l'absence de recopie, ce qui est plus fort.
- **La garde de la note** est dans `evaluationEntreDansLaNote`, verrouillée ou non : au bon endroit.
- **Le refus du verrou** est dans la porte (`sauvegarderEvaluation`), donc aussi pour le cadenas et pour le bouton de la palette Annotation ; il le dit. Nécessaire (break-test).
- Les mots affichés reprennent le libellé de Grégoire ; l'aide est conforme au § 4.

## Retouche demandée (le lot n'est pas fini)

1. **Le PDF d'une copie cochée après des niveaux** (§ 5 de la demande) : décision de Cowork, **réversible** – rien n'est vidé en base ; le PDF d'une évaluation qui porte le statut ne montre ni critère ni niveau, exactement comme celui d'une copie cochée avant tout niveau (ce qui a été mesuré). Aucun mot nouveau pour l'élève. Mesuré par un test qui coche la case APRÈS des niveaux.
2. **La pastille après décochage** : `_poserPastilleTravailEnCours` remet « Importé » d'office ; elle doit reprendre l'état réel de la copie (une copie annotée dit « Annoté »), celui que calcule sa sélection.

## Dispositions

- **Le C des spécifications** (§ 3 de la demande) : soumis à Grégoire à 11 h 28 ; il a choisi à 11 h 30 de **mettre la copie de côté pendant le délai** (ni acceptable ni non acceptable). **Mesuré ensuite par Cowork : c'est déjà ce que fait le code, rien à changer.** `calculerDetailsCompletion` et `detecterDefis` (`pratique-pan-specifications.js`) écartent toute évaluation sans note (`noteFinale !== null`), et le dénominateur est fixe (les travaux exigés du palier le plus haut), pas un compte de copies : une copie incomplète a le même effet qu'aucune copie. La formulation de la demande (« vaut non acceptable ») et celle de Cowork devant Grégoire (« le C baisse ») étaient inexactes ; Grégoire en a été informé. Le banc doit le fixer (consigne de retouche, § 3).
- Trouvaille 1 (le calcul de C de la Liste, lu par personne) : **commenter et oublier**, fait.
- Trouvaille 2 (`mettreAJourPillStatut` écrit dans une pastille disparue) : **commenter et oublier**.
- Trouvaille 3 (contraste de la famille « un geste attendu », environ 2,3:1, que la nouvelle pastille rejoint) : **inscrit**, à porter au BACKLOG avec la retouche ; un seul couple de couleurs à corriger pour toute la famille, hors de ce lot.
