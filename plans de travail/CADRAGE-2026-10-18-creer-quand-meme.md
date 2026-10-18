# Cadrage – la dissection : créer la grille même s'il manque des points

> Cowork, dimanche 18 octobre 2026, 17 h 35 (Toronto, mesuré par `date`). Décision de Grégoire, 17 h 34 (« oui, ça va »). Né de sa capture de 17 h 24 : « Créer ma grille » grisé sur sa grille sur le symbolisme, avec « des points ou des niveaux » et « les points de 2 critères ». Sa remarque : « Il se pourrait que du travail reste à faire sur la grille et qu'il soit complété dans « Grilles de critères ». » **Aucun code avant la consigne de Cowork.**

## Ce qu'il a décidé

1. **La dissection crée la grille même s'il manque des points** : les raisons qui ne viennent QUE de points ou de pondérations manquants cessent de bloquer ; la liste les dit encore, comme ce qui reste à compléter dans « Grilles de critères ».
2. **Ce qui protège contre une perte ou un objet faux bloque toujours** : un morceau étiqueté sans place, un nom vide, trop long ou déjà pris, des points hors de 0 à 100 ou non entiers, un nom de niveau vide ou en double, plus de 20 réponses, une clé en « _ », un texte de plus de 5 000 caractères.
3. **« Grilles de critères » le dit** : pour une grille en points, la ligne du total dit combien de critères n'ont pas de points (comme elle dit « … % manquant » pour une grille en pourcentages).
4. **L'évaluation le dit** : tant qu'un critère n'a pas de pondération, la note d'une copie évaluée avec cette grille affiche « -- », comme la garde existante quand une partie de la grille n'est pas évaluée (`calculerPortee`, `js/evaluation-calcul.js`). **Un critère mis à 0 exprès ne change pas** : seule l'absence de pondération compte.

## Ce qui est mesuré (sous-agent de Cowork, `c2cff80e`, lecture du code ; points clés relus par Cowork)

- Sans pondération, la création écrit `NaN` (IndexedDB) ou `null` (localStorage), jamais 0 ni un champ absent ; la confirmation afficherait « sur NaN point. » (`materiel-creation.js:96`).
- « Grilles de critères » ne plante pas : le total compte le critère pour 0, sans signal ; l'éditeur montre un champ vide et accepte la saisie. Défaut : « Voir les critères » écrit « null point » ou « NaN point » (`grilles.js:923`). Le signal « manquant » et l'avertissement à l'enregistrement (#483) n'existent que hors d'une grille en points (`ponderationEnPoints`, `grilles.js:1294`, `830`) : relu par Cowork.
- À l'évaluation, `calculerPortee` ne range un critère « hors note » que si sa pondération est > 0 (`evaluation-calcul.js:940`, `949`) : un critère sans pondération sort de la note en silence, et la note se calcule sur les autres. Relu par Cowork. Inféré : l'écran de saisie montre « sur ? », la copie garde `ponderation: 0`, le PDF pourrait afficher « 3 / 0 » (`travaux-export-pdf.js:1031`).

## Ce que le plan doit trancher ou mesurer (Claude Code, puis Cowork)

- **Le stock** (« tarir n'est pas réparer ») : des grilles existantes ont-elles déjà un critère sans pondération ? La garde de l'évaluation changerait l'affichage de leurs notes. Les notes d'A2025 et d'H2026 ne sont pas rouvertes : la garde ne doit pas changer ce qu'affichent ces trimestres clos. À mesurer et à écrire, pas à découvrir.
- **NaN ou null** : la création écrit désormais une absence franche et uniforme (même valeur en IndexedDB et en localStorage), et chaque lecteur la reconnaît.
- **Les affichages « NaN point » / « null point »** (confirmation de la création, « Voir les critères ») deviennent atteignables par ce chemin : ils sont à finir dans le lot.
- **Tranché par Cowork (17 h 47, technique)** : une grille sans AUCUN point, aucune pondération ni aucun niveau (logique nulle) **bloque toujours** : l'application ne sait pas si elle est en points ou en niveaux, et créer en points une grille en niveaux mal étiquetée serait un objet faux. Sans niveaux, la grille se lit en points dès qu'un critère a une pondération ou qu'un morceau porte « Points ». C'est ce qui débloque la capture de 17 h 24 même sans « Rattacher ».
