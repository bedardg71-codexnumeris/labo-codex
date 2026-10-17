# Plan de match – « Apporter mon matériel », prêt pour lundi

> Arrêté le samedi 17 octobre 2026 à 9 h 40 (Toronto) par Grégoire et Cowork. Rencontre de la communauté de pratique : **lundi 19 octobre, 11 h**. But de Grégoire : leur présenter un outil le plus achevé possible, qu'ils éprouvent dès lundi ; corrections lundi après-midi ; une chronique de Codex Numeris pour l'expérimenter dans la semaine. Motif : l'adoption de l'application (cadrage, « Posture arrêtée le 17 octobre »).
> ⛔ **Règle de Grégoire (9 h 39) : l'heure ne compte pas.** On passe d'une étape à la suivante quand la précédente est finie, samedi ou dimanche peu importe. Une étape est **finie** quand elle est commitée, relue par Cowork, ses corrections commitées, Vitest complet vert.
> Tenu par Cowork : il coche ici chaque étape finie, avec son commit.

## Les étapes, dans l'ordre

> ↻ **Ordre modifié à 9 h 51, demande de Grégoire (9 h 50)** : avant tout, un bandeau « En construction » dans l'onglet, puisque le lot 1 est en production ; puis l'étape 1 ; puis **l'étape 3 avant l'étape 2**, poussée **sans release**, pour que le bandeau atteigne les utilisateurs. Ordre réel : bandeau, 1, 3, 2, 5, 6, 7, 8 (4 est faite). Le bandeau reste jusqu'à ce que Grégoire décide de le retirer.

1. **Le menu de rôle, clos.** Claude Code applique la relecture de Cowork du lot 3a. *(VERDICT-RELECTURE-2026-10-17-apporter-mon-materiel-3a.md)*
2. **Ce que l'assistant écrit se voit dans l'application.** Dans Grilles de critères, sur chaque critère : ses descripteurs par niveau et ses sous-critères, en lecture. Les boutons de la confirmation ouvrent l'outil avec l'objet créé sélectionné. Les deux textes « fichier d'origine plutôt que PDF » (validés à 8 h 53). *(CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-3b1-visible.md)*
3. **Première version en ligne, à ton signal.** Release, vérification complète (Cowork, Chrome et Safari fermés, environ une heure), push. Puis ta porte terrain : tes vraies grilles, sur le Mac et l'iPad. Motif : un filet pour lundi ; si la suite n'aboutit pas, c'est cette version que la communauté éprouve.
4. **La mesure : une grille sans niveaux devient une grille en points.** Cowork, en lecture seule, peut se faire pendant les étapes 2 et 3 : le type de critère « analytique » (points saisis sur le maximum du critère, niveau déduit au calcul) ; comment se calcule la note finale sans descripteurs ; quelle échelle il faut, et d'où elle viendrait sans rien inventer.
5. **Les grilles sans niveaux acceptées telles quelles** (des points par critère, des commentaires), d'après la mesure. *(CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-5-points.md, écrite à 9 h 48)*
5b. **La reconnaissance, d'après les douze échantillons de Grégoire.** Une autre session Cowork les analyse en lecture seule (`CONSIGNE-COWORK-2026-10-17-analyse-12-echantillons.md`, écrite à 11 h 32), pendant que Claude Code fait l'étape 5 ; sa proposition (`PROPOSITION-2026-10-17-reconnaissance-des-grilles.md`) devient la consigne d'un lot, après l'étape 5. **Proposition rendue à 12 h 10 ; consigne écrite à 12 h 48** : `CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-5b-reconnaissance.md`.
6. **« Aller plus loin avec ta grille », première forme modeste.** Après la création, une invitation au conditionnel, sans jugement sur la grille (nom validé à 9 h 30). Forme à proposer par Cowork, à faire valider. **Orientation de Grégoire (9 h 42)** : une grille en points sans échelle, comme sa grille de 1995, est une grille analytique appliquée sans le savoir, le type le plus employé dans le réseau aujourd'hui ; « Aller plus loin » présenterait les trois types de critères (holistique, analytique, algorithmique) que l'utilisateur pourrait employer et que l'application exploite pour mieux suivre les apprentissages. « Nous allons miser là-dessus. » **Forme et textes validés à 12 h 07** : `CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-6-aller-plus-loin.md`. **Ordre décidé à 12 h 07** : 6, puis 5b (le rapport de l'autre session, quand il est prêt), puis 7, pour que la page des textes couvre aussi ceux de 5b.
7. **Tes textes.** Une seule page avec tous les textes provisoires des étapes 1 à 6, à corriger par toi ; puis l'entrée des Nouvelles. Claude Code applique tes corrections.
8. **Version finale en ligne, à ton signal**, vérification complète la nuit d'avant ; en ligne lundi matin. Ta porte terrain avant 11 h.

En continu, d'une étape à l'autre : chaque mise en page de grille que tu essaies (capture de l'original et de la lecture) devient une grille fictive de même forme dans les bancs.

## Repli

Si l'étape 8 arrive avant la fin des étapes 5 et 6, la version finale emporte ce qui est fini et relu, rien d'autre ; le reste se présente lundi comme « la suite annoncée ».

## Après lundi

La fusion de la vérification sur GitHub (lundi après-midi, après la rencontre) ; tes corrections de l'après-midi ; la chronique.

## Avancement

- [x] 1 — en ligne le 17 à 11 h 08 (`4a972d13`), avec le bandeau « En construction »
- [x] 2 — `96812253`, relu et accepté à 11 h 27, non poussé
- [x] 3 — en ligne le 17 à 11 h 08, sans release (1.202.0), vérification complète sans rougeur
- [x] 4 — mesure écrite le 17 à 9 h 43 : `MESURE-2026-10-17-grilles-en-points.md` (faisable sans rien inventer)
- [x] 5 — `51a7be2b`, relu et accepté à 12 h 05, non poussé (avec #1095, la rangée du critère sur l'iPad)
- [ ] 5b — `d75d8f09`, relu à 14 h 02 : deux corrections à commiter (`VERDICT-RELECTURE-2026-10-17-apporter-mon-materiel-6-et-5b.md`), plus les icônes « i » hors lot
- [x] 6 — `1c1868e0`, relu et accepté à 14 h 02, non poussé
- [ ] 7
- [ ] 8
