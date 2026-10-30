# Verdict de relecture – La retouche du niveau RàI au critère (2daba642)

> Cowork, vendredi 30 octobre 2026, 19 h 49 (Toronto), sur `main` = `2daba642`. Relecture directe du diff (`js/`, `index.html`), sans session déléguée, faute de temps ; rien exécuté.

## Verdict

**Accepté.** C1 : la barre des patterns écarte par « Données insuffisantes » ; `determinerCibleIntervention` lit `carte.pattern` (même source que le palier de la carte). C2 : `libelleSignalement` déclaré (chaîne, 200). C3 : `noteDuCoursAffichee` exporté, lu par la carte RàI (« — » sans note affichée). C4 : le guide dit « En attente », non-participation, diagnostic. C5 : badge « En attente » (`badge-attente`, classe définie, `styles.css:3456`), 0 non compté, une analyse enregistrée avec une clé '0' écartée à la lecture sans réécriture. C6 et T3 : gardes ajoutées. Jetons bumpés pour les 7 fichiers `js/` modifiés.

## À savoir

- Le schéma de partage est fermé : une application plus ancienne refuse un paquet qui porte les nouveaux champs du palier. Déjà vrai depuis `a8bf7778` (`leveSignalement`, `niveauSignalement`) ; sans conséquence tant que tout le monde charge la version en ligne.
- La phrase du guide RàI (C4, `js/guides-pedagogiques.js:216`) : soumise à Grégoire le 30 oct. vers 19 h 55 ; sa validation passe par le relais qu'il colle.
- Les fichiers de Cowork de `plans de travail/` (consignes, réflexion, verdicts, textes) sont à commiter avant la release ; `captures/` reste hors commit.
