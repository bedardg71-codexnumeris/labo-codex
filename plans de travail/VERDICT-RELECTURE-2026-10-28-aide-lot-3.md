# Verdict de relecture – L'Aide, lot 3 : un seul glossaire (#1152)

> Cowork, mercredi 28 octobre 2026, 14 h 15 (Toronto, mesuré par `date`), sur `main` = `9e827b0e`. Lu : la demande de relecture (les 29 définitions, terme par terme), le diff de `4ec64491` pour `js/accompagnement.js` et `css/accompagnement.css` ; les cinq critères SRPNF lus dans `js/pack-demo-10.js`. Playwright non rejoué.

## Verdict

**Accepté, avec une retouche d'un mot.** Le point 4 est la vraie trouvaille du lot : l'encadré d'un terme souligné s'ouvrait sous la fenêtre d'aide, et « En savoir plus » aurait mené à Commencer ; corrigé sans toucher `js/navigation.js` ni `js/config.js`. La ligne de `css/accompagnement.css` (le `z-index`) est acceptée : elle est la moitié nécessaire du correctif, et la consigne n'avait pas prévu qu'il en faille une. Les suppositions sont retenues (« Codex (le fichier) » et « Archive (…) », pour ne pas souligner « Labo Codex » ; STD corrigée comme #803 ; 782 mots au glossaire, la Référence en perdant 882).

## La retouche (Claude Code)

1. **« Codex (le fichier) »** : « dans le menu Codex, en haut à gauche de l'écran » devient « dans le menu Codex, en haut de l'écran », comme la FAQ et « Résolution de problèmes courants » (lot 2d) ; une position à gauche ou à droite dépend de la largeur de l'écran (décision de Cowork).
2. **Les mots de Grégoire** (§ ci-dessous), une fois rendus.

## Les 29 définitions (décision de Cowork)

Vingt-huit restent telles que la demande les donne, sauf objection de Grégoire : elles corrigent un fait mesuré, ou reprennent mot pour mot les textes déjà validés des lots 2a à 2d (le codex, le stockage local, le mode anonymisé, la note remise, la case « Incomplet », les jetons, le niveau RàI, les archives et « Faire revenir », acceptés le 4 oct.), ou appliquent une décision déjà rendue (D5 pour le sous-critère ; PAN, 17 sept. ; #803 pour Portfolio, Artefact et STD). **Une seule va à Grégoire : SRPNF**, qui dit ce qu'est sa grille de référence (« une grille d'exemple, et non une structure du logiciel ») : c'est sa didactique.

## Les mots de Grégoire

**Validée par Grégoire le 28 oct. 2026 à 14 h 15** (« on garde »), mot pour mot, telle que la demande la donne : « Les initiales des critères des grilles de la démonstration : Structure, Rigueur, Plausibilité, Nuance et Français écrit. Une grille d'exemple, et non une structure du logiciel. Toute grille de critères fonctionne de la même façon, quel que soit ton nombre de critères et ta discipline. » Note la validation dans le commentaire du terme.

Un commit pour la retouche, un pour les docs ; demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-28-aide-lot-3-retouche.md`. Pas de release, de verdict ni de push sans le signal de Grégoire.
