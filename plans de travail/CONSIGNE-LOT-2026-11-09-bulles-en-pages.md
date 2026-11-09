# Consigne : « Les bulles en pages »

Décidé avec Grégoire le 9 nov. 2026, 16 h 06, en Cowork. Relayé à la session des parcours (cloud).

**Branche** : `lot/bulles-en-pages`, partie de `origin/lot/bulle-sur-telephone` (le moteur du groupe 2, en verdict
sur le Mac). Elle sera remise sur `origin/main` quand le groupe 2 y sera. La fusion se fera sur le Mac, au groupe 3,
avant les parcours.

## Ce que le lot fait

1. Dans le moteur (`js/parcours-moteur.js`), une bulle dont le texte dépasse environ dix lignes à sa largeur se
   coupe en deux pages (trois au plus si la mesure l'exige), à la fin d'une phrase, au plus près du milieu. Ni mot
   changé, ni coupure au milieu d'une phrase ou d'une citation entre guillemets.
2. Navigation : « → » mène à la page suivante, « ← » revient ; « 1/2 » à côté de « n sur N ». Au clavier : les
   flèches gauche et droite quand la bulle a le focus. Accessible au lecteur d'écran (le texte des deux pages reste
   lisible dans l'ordre).
3. La ligne orange du geste reste visible sur chaque page, avec « Plus tard » et le bouton de l'étape. L'étape avance
   toujours sur le geste, quelle que soit la page affichée.
4. Le défilement interne du lot de la bulle reste le dernier recours (très petits écrans). La bulle repliée sur
   téléphone garde son comportement ; dépliée, elle se pagine comme ailleurs.
5. Aucun parcours n'est modifié dans ses textes ; seul l'affichage change. Les sondes de placement des parcours 3, 6,
   8 et 9 doivent continuer de tenir : dire lesquelles il a fallu toucher.

## Vérification

- Essais : une bulle courte n'est pas coupée ; une longue se coupe à une fin de phrase ; la ligne du geste est visible
  sur chaque page ; le geste fait avancer depuis la page 2. Break-test.
- Captures Chromium à 1180 et 820 px de trois bulles longues (parcours 9 étape 1, parcours 7 étape 7, parcours 3
  étape 2) dans `plans de travail/captures-2026-11-09-bulles-en-pages/`.
- Précision de Grégoire (même jour) : pour ces captures et ces essais, fusionner EN LOCAL, sans les pousser sur la
  branche, `origin/lot/parcours-9-notation-alternative`, `origin/lot/parcours-7-lire-ta-classe` et
  `origin/lot/parcours-3-evaluer`. La branche ne porte que le moteur. Si une fusion locale conflicte, prendre une seule
  de ces bulles et le dire.
- Rapport : `plans de travail/RAPPORT-2026-11-09-bulles-en-pages.md`. Pousser.
