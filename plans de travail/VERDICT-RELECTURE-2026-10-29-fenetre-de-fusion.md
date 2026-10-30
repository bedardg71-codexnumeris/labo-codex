# Verdict de relecture – La fenêtre de fusion en deux colonnes (#1186)

> Cowork, vendredi 30 octobre 2026, 5 h 10 (Toronto, mesuré par `date`), sur `main` = `3ba57c08` (non poussé). Lu : la demande de relecture ; `js/codex-fusion-fenetre.js` (rendu par `insertAdjacentHTML` d'un gabarit dont chaque valeur passe par `_e` → `echapperHtml` ; les mots qui changent passent par `textContent`) ; les deux captures (1 280 et 820 px), comparées à l'ébauche. Vitest et Playwright non rejoués.

## Verdict

**Accepté, avec une retouche de mots** (validés par Grégoire le 30 oct. à 5 h 09).

Retenus tels quels : la fenêtre sœur plutôt que `creerFenetreDeuxColonnes` ; la fin dans une seconde fenêtre ; le clic à côté qui ne ferme pas ; le pied qui reste visible ; « Diffère par : image » ; le cas sans conflit dans la même fenêtre ; la lecture unique de l'appareil (`js/appareil.js`) et les valeurs du rapport de bug devenues justes. Les captures suivent l'ébauche.

## La retouche (Claude Code) : les mots validés par Grégoire, mot pour mot

1. **`brouillonDissection`** se nomme **« ta grille en cours dans « Apporter mon matériel » »** (le mot « dissection » ne paraît nulle part à l'écran). En tête, par exemple : « Viendront de l'autre codex, sans question : 18 évaluations, 18 annotations, 18 durées d'évaluation et ta grille en cours dans « Apporter mon matériel ». » En titre de rangée, s'il y a conflit : « Ta grille en cours », sous « Conception › Apporter mon matériel ».
2. Les autres noms, tels que proposés : « le rythme de travail », « les textes de tes tampons », « tes tampons personnalisés », « les interventions ».
3. La fin : « De l'autre codex : … » ; **« Versions de l'autre codex retenues : … »** (remplace « Version de l'autre codex gardée pour : … ») ; « À la corbeille, comme dans l'autre codex : … ».
4. Sous une clé-objet, **« 1 autre réglage identique »** au lieu de « 1 autre identique ». Le nom suit la clé, dans la table des libellés : « réglage » pour le rythme, « texte » pour les textes des tampons, « tampon » pour les tampons personnalisés ; « élément » en repli. Pluriel : « N autres réglages identiques ».

Mets à jour les tests qui lisent ces mots ; break-test sur le nom de `brouillonDissection`. Un commit pour le code, un pour les docs. **Pas de release** : elle partira avec le lot 5 des standards, Nouvelles à valider par Grégoire.
