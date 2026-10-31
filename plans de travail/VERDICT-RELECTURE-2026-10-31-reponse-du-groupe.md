# Verdict de relecture – La réponse du groupe (6b6b8267)

> Cowork, samedi 31 octobre 2026, 8 h 13 (Toronto), sur `main` = `6b6b8267`. Relecture du diff (`js/tableau-bord-apercu.js`, `js/profil-etudiant-calculs.js`, `js/preferences-v2.js`, `js/preferences.js`, `js/contexte-qualification.js`, `index.html`) et du rapport `RAPPORT-2026-10-31-reponse-du-groupe.md`. Aucun test lancé, captures non regardées.

## Verdict

**Accepté.**

- § 0 tenu : la boucle de la phrase de groupe et `signauxDeGroupeDepistage` sont retirées, sans autre consommateur. Réglage éteint, `genererCarteReponseDuGroupe` rend une chaîne vide.
- La préférence n'est écrite qu'au geste (`sauvegarderReponseDuGroupeV2`, `data-on-change`), absente elle vaut « éteinte » : pas de stock.
- La case reste grisée tant que « Voir ce que mes seuils donnent » n'a pas été cliqué, sauf si elle est déjà cochée : l'ordre décidé (seuils, ce qu'ils donnent, choix) est tenu par le geste, pas seulement par la mise en page.
- Le réglage et la carte lisent la même population : `obtenirEtudiantsCoursActif()` moins les exclus, des deux côtés.
- Sécurité : les deux `innerHTML` neufs ne portent que des nombres et des libellés du code, aucun texte d'utilisateur. Aucun handler inline.
- La garde « avant toute note, la comparaison attend » est juste : sans elle, la carte aurait dit « 0 % au niveau 1, renforcé » pour tout groupe en début de trimestre.

## À reprendre avec les mots (avant la release)

- Le texte d'Aide proposé écrit « Labo → Outils d'observation » ; l'application n'emploie qu'un séparateur, « › » (#1189). À corriger quand Grégoire validera ce texte.

## À Grégoire

- La part au niveau 1 pendant la montée des notes : **B, décidé par Grégoire le 31 oct. à 8 h 14** (« oui », sur la recommandation de Cowork et de Claude Code).
- Les mots du lot (liste au rapport) : à valider avant la release.

## Pour Claude Code : la retouche B

1. **La part se calcule sur les étudiant·es dont la note du cours s'affiche, plus « Non-participation ».** Les autres, signal ou non, sont hors des pourcentages et comptés dans la ligne « en attente de la note du cours ». La garde « avant toute note, la comparaison attend » reste.
2. **Une seule source** : `repartitionDuGroupe` porte la règle ; la carte de l'Aperçu et le réglage affichent les mêmes pourcentages.
3. **Dans le réglage, aucun signal ne disparaît** : un·e étudiant·e en « Difficulté persistante » ou signalé·e avant sa note reste dans « D'où viennent les niveaux 2 et 3 ». Comment le réglage le montre à côté des pourcentages : à toi de trancher (technique) ; toute phrase neuve rejoint la liste des mots à valider.
4. Une garde qui reprend l'exemple du rapport (10 au niveau 1 avec note, 5 en « Difficulté persistante » sans note, 10 en attente) : la carte dit 100 % et « proche du repère ». Break-test.
5. Commit seul, sans release ni push. Relecture de Cowork ensuite ; puis les mots.

