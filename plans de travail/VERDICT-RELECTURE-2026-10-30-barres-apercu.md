# Verdict de relecture – Les barres colorées de l'Aperçu (262c18bd)

> Cowork, vendredi 30 octobre 2026, 22 h 27 (Toronto), sur `main` = `262c18bd`. Relecture directe du diff de `js/tableau-bord-apercu.js` et des deux captures (Chrome, Mac) ; rien exécuté.

## Verdict

**Accepté.** Une seule fonction d'axe (`positionSurEchelleDistribution`, son inverse pour la courbe), cassure au seuil le plus bas lu à la source (`borneBasseAssiduiteCompletion`), P toujours proportionnel, réglage sans écriture tant qu'on ne choisit pas. `fondDeLaBarre` : passage centré, arrêt exact au seuil (`couleurAuSeuil`), demi-largeur au moins 1,5 point, zones prises entre deux passages qui gardent leur couleur au milieu. L'écart à l'ébauche (arrêt au seuil plutôt que milieu glissant à la cassure) est juste. Graduations sous A et C seulement : écart justifié par #821.

## À Grégoire

- **Le passage au seuil de la cassure, en deux segments** : calculé en points de pourcentage, il fait 1 % de la largeur à gauche du seuil (le premier quart compresse 55 points) et 12,5 % à droite : le rouge s'arrête net, l'orange s'étale (capture). Recommandation de Cowork : à ce seul seuil, et dans ce seul mode, calculer le passage en largeur d'écran (même largeur des deux côtés), la couleur au seuil restant exacte.
- **Les mots du réglage** (rapport, « Les mots à valider par Grégoire ») : six textes.

## Inscrire

- Aperçu, sous la barre P : « 1 étudiant·e en Développement montrent une progression favorable et pourraient atteindre la maîtrise prochainement » (capture) : accord faux au singulier, visible sur ses écrans ; le rapport le range en issue 3, Cowork le relève en issue 2 (symptôme visible).
