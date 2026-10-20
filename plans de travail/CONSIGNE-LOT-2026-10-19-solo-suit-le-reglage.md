# Consigne – SOLO suit le réglage : la complexité et le palier SOLO se masquent quand l'observation SOLO est désactivée (#1117)

> Écrite par Cowork le lundi 19 octobre 2026 à 22 h 06 (Toronto, mesuré par `date`), sur `main` en 1.209.0 (`c8acbe8a`). Demande de Grégoire (21 h 59) et ses décisions (22 h 02, 22 h 05), fiche #1117 du BACKLOG. Motif, dans ses mots : simplifier l'interface de qui n'utilise pas SOLO comme outil de dépistage ; « ça ne donne rien d'avoir un menu avec l'option « aucun » dedans si la taxonomie solo n'est même pas utilisée ». **Aucune porte terrain** : une machine répond à tout ce qui suit.

## Ce que l'enseignant fait à la fin de ce lot

Dans ses préférences, il décoche « Activer l'observation de la structure des résultats d'apprentissage ». Dans Grilles de critères, aucun critère ne montre plus « Complexité SOLO du critère » ; dans Échelles de performance, aucun niveau ne montre plus « Palier SOLO du niveau ». Il crée un critère à la main, ou une grille par « Apporter mon matériel » : le critère reçoit « Aucun ». Il recoche la case : les menus reviennent, avec les valeurs enregistrées telles qu'elles étaient.

## Ce que la mesure a établi (Cowork, lecture seule)

- La préférence : `afficherDescriptionsSOLO` (`preferences.js`, défaut `true` ; case `v2-pref-solo` dans `index.html`, écrite par `preferences-v2.js`). Les lecteurs existants la lisent par `obtenirPreference('afficherDescriptionsSOLO') !== false` (`profil-etudiant-sections-affichage.js`, `tableau-bord-apercu.js`, `travaux-outils.js`) : reprendre ce patron.
- « Complexité SOLO du critère » : deux rendus dans `grilles.js` (le critère en cours de création, `modifierCritereTempHandler` ; la grille existante, `modifierCritereGrilleHandler`). Aucun ne lit la préférence.
- « Palier SOLO du niveau » : deux rendus dans `echelles.js` (`optionsNiveauSOLOEchelle`). Aucun ne lit la préférence.
- Les défauts écrits : `grilles.js`, création d'un critère, `niveauSOLO: 'multistructurel'` (commentaire du lot 4, volet B) ; `materiel-assistant.js`, `construireGrille`, même valeur. « Aucun » (`'aucun'`) veut dire : le critère compte dans la note, le dépistage le saute (même commentaire). `calculerIPB` lit un `niveauSOLO` absent comme multistructurel.
- Autres lecteurs de `niveauSOLO`, à passer en revue : `trimestres.js`, `profil-etudiant-helpers.js`, `import-export.js`, `interventions.js`, `tableau-bord-apercu.js` (`grep -rn "niveauSOLO" js`). Un **affichage** de la complexité d'un critère ou du palier d'un niveau qui s'y trouverait suit la même règle ; un **calcul**, non.

## Ce qu'il faut

1. **Masquer** les deux champs de `grilles.js` et les deux de `echelles.js` quand la préférence est désactivée (le champ, son étiquette, son aide). Masquer n'écrit rien : la valeur enregistrée ne bouge pas, et enregistrer une grille ou une échelle pendant que le champ est masqué la garde telle quelle.
2. **Le défaut d'un critère neuf.** « Apporter mon matériel » écrit `'aucun'` **dans tous les cas** (Grégoire, 22 h 02 : la dissection ne choisit pas pour l'enseignant). La création à la main écrit `'aucun'` quand la préférence est désactivée (Grégoire, 22 h 05) ; préférence activée, elle garde son défaut d'aujourd'hui.
3. **Réactiver** : la case recochée, les menus reviennent avec les valeurs enregistrées. Si un éditeur est ouvert au moment du changement, à toi de trancher s'il se redessine aussitôt ou à sa prochaine ouverture ; dis-le.
4. **Les échelles** : seul l'affichage change. Les paliers SOLO du modèle d'échelle par défaut (`echelles.js`, niveaux par défaut) restent tels quels (supposition de Cowork, dite à Grégoire).
5. **Le stock** : les grilles déjà créées gardent leur « multistructurel ». Tarir la source ne les touche pas ; les réécrire remonterait à Grégoire. Dis-le dans la demande.
6. **Les bancs.** Vitest : le défaut d'un critère neuf selon la préférence (fonction pure si possible) ; « Apporter mon matériel » écrit `'aucun'`. WebKit : préférence désactivée → les champs absents dans Grilles et dans Échelles ; un critère qui porte « relationnel », la grille enregistrée champ masqué, la page rechargée, la case recochée → « relationnel » toujours là. Break-test : un masquage qui écrirait `'aucun'` par-dessus la valeur enregistrée doit faire rougir le banc.

## Les textes

Aucun texte neuf attendu. S'il en faut un, il est provisoire et listé dans la demande. L'entrée des Nouvelles se propose à la version, pas dans ce lot.

## Ce qu'il ne faut pas

- Écrire dans le `niveauSOLO` d'une grille ou d'une échelle existante, de quelque façon que ce soit (au masquage, au chargement, à la réactivation).
- Toucher au calcul du dépistage (`calculerIPB` et voisins) : il lit ce qui est enregistré, comme aujourd'hui.
- Offrir le choix du niveau SOLO dans « Apporter mon matériel » (plus tard, sans fiche).
- Le verdict complet, un numéro de version.

## Livrer

Un commit sur `main` avec cette consigne, le BACKLOG (fiche #1117 inscrite par Cowork, non commitée ; la cocher) ; Vitest complet vert ; les specs de Grilles de critères, d'Échelles et `materiel-*` touchées vertes dans WebKit ; la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-19-solo-suit-le-reglage.md`. Dans un commit séparé (fichier de Cowork) : `plans de travail/PLAN-2026-10-19-bareme.md`, l'ébauche du barème, sans rien coder. **Puis arrête-toi.**
