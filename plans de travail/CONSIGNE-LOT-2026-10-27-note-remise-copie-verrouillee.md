# Consigne – La note remise : une copie verrouillée montre ce que l'étudiant·e a reçu

> Écrite par Cowork le mardi 27 octobre 2026 à 07 h 29 (Toronto, mesuré par `date`), sur `main` = `3b5159de` (lot 4a accepté : `VERDICT-RELECTURE-2026-10-27-calculs-4a.md` ; rien de poussé).
> **Source** : la mesure du piège 2 du lot 4a (`DEMANDE-RELECTURE-2026-10-27-calculs-4a.md`) : après un changement de calcul, une copie **verrouillée** rouverte montre la note recalculée (85) alors que la base et l'étudiant·e ont 70 ; déverrouillée, elle s'enregistre à 85 au premier geste. Comportement antérieur au lot 4a. **Décision de Grégoire le 27 oct. à 7 h 28**, sur la proposition de Cowork, textes compris.
> Ce lot passe **avant** le lot 4b : il rend vraie la phrase que 4a n'a pas pu poser, et 4b rendra les changements de calcul plus fréquents.

## 0. Avant tout

- Un seul lot à la fois, sur un `main` à jour, aucune suite qui tourne. Les documents non commités de Cowork ne sont pas un obstacle.
- Rituel de début de session.
- Un commit de docs seul, fichiers nommés : ce fichier, `VERDICT-RELECTURE-2026-10-27-calculs-4a.md`, et un item du BACKLOG (donne-lui un numéro) : il entre parce qu'il touche des notes remises et qu'il bloque une phrase du chantier en cours.

## 1. Ce que Grégoire a décidé (27 oct., 7 h 28), mot pour mot

1. **Une copie verrouillée affiche la note remise**, celle que la base garde. Si le calcul actuel de la grille donnerait une autre note, une ligne le dit, sous la note : « Note remise : {remise}. Avec le calcul actuel de la grille, elle serait de {actuelle}. Déverrouille l'évaluation pour l'appliquer. » Les deux nombres au format de l'application (`formaterNotePourcentage`).
2. **Une copie déverrouillée suit le calcul actuel**, comme aujourd'hui, sans ligne.
3. **Sous les cartes de l'étape « Note calculée »**, après « La note reste entre 0 et la pondération du critère. » : « Une copie déjà évaluée garde sa note. Elle ne suit le nouveau calcul que si tu la déverrouilles et la modifies. » **Seulement si la preuve du § 5 la rend vraie.**

## 2. Ce que « affiche la note remise » couvre (décidé par Cowork ; si la mesure le contredit, dis-le)

- **Tout ce que la copie verrouillée montre vient de la base** : la note de la production ; pour chaque critère, son niveau ; pour un critère algorithmique, sa note, son pourcentage, son niveau et la phrase enregistrée (`donneesAlgorithmiques`). La ligne chiffrée d'un critère algorithmique (`_afficherFormuleAlgo`) ne paraît que si le calcul actuel redonne la note enregistrée : sinon elle décrirait un calcul qui n'a pas produit cette note.
- **La note actuelle se calcule comme aujourd'hui, mais à part** : elle ne s'affiche que dans la ligne, ne s'écrit nulle part et ne passe pas dans `noteCalculeeCourante` tant que la copie est verrouillée. Comparaison à la précision affichée : pas de ligne pour un écart d'arrondi.
- **La ligne vaut pour toute cause**, pas seulement un calcul changé : une pondération, une échelle ou une pratique changées donnent aussi une autre note, et c'est la même vérité (« le calcul actuel de la grille »). Mesure et nomme, dans la demande de relecture, les causes que tes essais rencontrent.
- **Déverrouiller** fait passer l'écran au calcul actuel (comme rouvrir une copie déverrouillée aujourd'hui) ; rien ne s'écrit avant un geste.
- **Le PDF d'une copie verrouillée** porte la note remise et les phrases enregistrées. Mesure d'abord d'où il les lit (la base ou l'écran) ; s'il lit l'écran, le § 2 premier point le règle ; s'il lit la base, dis-le.
- **Sans note** (« Incomplet ; travail en cours », note nulle ou absente) : aucune ligne.

## 3. Pièges connus

1. **Ouvrir une copie verrouillée n'écrit rien** : stockage comparé avant et après, comme la spec du lot 4a.
2. **Les recalculs différés du chargement** (`evaluation.js` l. ~725-770 : les champs relancés à 100 ms, `calculerNote` à 350 ms) ne doivent pas écraser l'affichage de la note remise.
3. **Deux chemins d'ouverture** : choisir l'étudiant·e et la production (`evaluation.js` l. ~700-770) ; « Modifier » depuis la liste (`evaluation.js` l. ~1065-1410, dont l'affichage de `noteFinale` l. ~1407). Les deux.
4. Les notes d'A2025 et d'H2026 : ce lot ne fait qu'afficher. Rien ne se recalcule ni ne se propose pour elles.
5. Règles 1, 2 et 4 de `CLAUDE.md` : `textContent` ; aucun gestionnaire en ligne ; aucun `console.log`. Aucun nom d'élève réel.
6. Le bouton s'appelle « Déverrouiller l'évaluation » (palette Annotation, 1.217.0) : la ligne y renvoie mot pour mot.

## 4. La retouche du lot 4a (verdict de Cowork)

`js/miroir-algo.js` l. ~103 : « Sans projection, ces copies ont la longueur fixée dans le calcul : chaque X y coûte un point, quelle que soit cette longueur. » devient « Sans limite fixée, ces copies ont la longueur fixée dans le calcul : à cette longueur, chaque X coûte un point. » Si la condition de cette phrase n'est pas « aucune limite fixée », garde « Sans projection » et dis-le.

## 5. Preuve exigée

- **Vitest** : la comparaison (pure) : notes égales, différentes, égales à l'arrondi près, sans note ; le texte de la ligne avec les deux nombres. Break-test.
- **Playwright (WebKit)** : une grille employée, une copie verrouillée à 70 ; on change le calcul de son critère algorithmique ; on la rouvre par les deux chemins : l'écran montre 70 et la ligne avec la nouvelle note ; le stockage est identique avant et après ; son PDF porte 70. On déverrouille : l'écran passe à la nouvelle note, rien ne s'écrit ; au premier geste, elle s'enregistre. Même essai avec une pondération changée (un critère non algorithmique). Une copie dont rien n'a changé : aucune ligne. 1 440 et 820 px.
- **Captures** : la copie verrouillée avec sa ligne, 1 440 et 820 px, clair et sombre.
- Portes terrain : skill `portes-terrain`, ses deux règles de tête d'abord.

## 6. Ce qui n'entre pas

Garder sur chaque copie le calcul qui l'a notée ; une ligne pour une copie déverrouillée ; rouvrir ou recalculer quoi que ce soit d'A2025 ou d'H2026 ; le lot 4b.

## 7. Clôture

- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-27-note-remise.md`.
- Pas de release, de verdict ni de push sans le signal de Grégoire.
