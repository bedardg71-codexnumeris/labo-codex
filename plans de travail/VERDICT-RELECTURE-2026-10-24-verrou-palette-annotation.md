# Verdict de relecture – le bouton du verrou aussi dans la palette Annotation

> Cowork, samedi 24 octobre 2026, 9 h 33 (Toronto). Relu : `61b62ccc` (le diff de `js/` entier), le rapport de Claude Code relayé par Grégoire à 9 h 32.

## Verdict : accepté, avec un complément

- **Une seule porte, tenue.** La copie affichée est celle du formulaire → `basculerVerrouillageEvaluationCourante` telle quelle. Autre copie verrouillée → le noyau extrait (`_deverrouillerEvaluation`), qui ne touche le formulaire, le cadenas et `evaluationEnCours` que si l'évaluation est celle du formulaire. Autre copie non verrouillée → chargement par le chemin d'« Évaluer », attente bornée (15 s) qui vérifie l'identité de l'évaluation ET de la copie (`copieEstCelleDeLEvaluationEnCours`), puis la porte.
- **Le compte des codes est juste au verrouillage** (vérifié par Cowork) : la porte passe par `sauvegarderEvaluation`, qui appelle `_forcerRecalculAlgorithmiqueAvantSauvegarde` → `mettreAJourCompteursErreurs` ; la garde #1142 est vraie à ce moment, puisque l'attente l'exige. Un code ajouté après le déverrouillage entre donc dans la note.
- Le bouton suit la copie (`remplirLabelsIdentite`), le retour d'« Évaluer » (`afficherPalettesAnnotation`) et la palette régénérée (`rafraichirPalettesApresPersonnalisation`). `data-action`, `textContent`, aucun `console.log`.
- Banc à vrais clics sur deux copies évaluées et une sans évaluation ; trois contre-épreuves démontrées.

## Complément demandé (le lot n'est pas fini)

- Échec du chargement : rien n'est écrit (juste), mais rien n'est dit, et Grégoire se retrouve en « Évaluer » sans savoir pourquoi. Mots de Cowork : « L'évaluation n'a pas été verrouillée : son chargement n'a pas abouti. » Porté par le § 3 bis de `CONSIGNE-LOT-2026-10-24-codex-a-part-et-aide-apercu.md`.

## Décision de Cowork

- **Après un verrouillage qui a dû charger l'évaluation, Grégoire reste en « Évaluer ».** Gardé tel quel : un code ajouté change la note, et c'est là qu'il voit la note recalculée de l'évaluation qu'il vient de verrouiller. Le retour automatique en « Annoter » lui ferait verrouiller une note qu'il n'a pas vue. À revoir s'il le demande.

## Le § 6 (commentaire et tampon sur une copie verrouillée)

- Établi par lecture du code, non vu à l'écran : ils s'enregistrent et entrent dans le PDF ; seul un code exige le déverrouillage (sinon le PDF montre un code de plus que le compte). Transmis à Grégoire le 24 oct. à 9 h 33.
