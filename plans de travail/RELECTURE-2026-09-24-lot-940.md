# Relecture croisée – lot #940 (1.156.4)

> Écrite le 24 septembre 2026 (Toronto), par Cowork, sur `lot-940-bilan-recurrents` = `c491b237`.

## 1 · Verdict : VERT pour le code ; UNE question de didactique remontée à Grégoire avant le push

Faite sur une copie `git archive` de `c491b237`, hors du dépôt.

- Bancs du bilan (`sentinelle-940` 21, `555-lot2-bilan-ecran` 13, `758` 5, `f4-1` 8, `lot3-analytique-niveau` 43, `576` 13) : 103 / 103 verts.
- **Quatre mutations de Cowork, quatre rouges** : M1 récurrence dès une production (6) · M2 mots de zone inversés (11) · M3 une copie postérieure lue comme antérieure (1) · M4 définition omise (4).
- Lu : une seule règle (`criteresATravailler`, `ligneCritereATravailler`, `lignesRecurrentes`, `historiqueAnterieur`) lue par le PDF et l'écran ; chaque copie lue dans son échelle ; plafond de cinq retiré pour le compte, gardé pour « Parcours » ; aucune donnée écrite.
- **Non refait par Cowork** : les specs WebKit. Ton vert fait foi.

## 2 · La question remontée à Grégoire (didactique – ne pas trancher)

`lignesRecurrentes` arrête la chaîne sur une copie antérieure où le critère **n'est pas évalué** (absent de sa grille), comme sur une copie où il est acquis. Or les productions d'un trimestre n'évaluent pas toutes les mêmes critères : une difficulté en « Structure » aux productions 1 et 3, avec une production 2 qui n'évalue pas la structure, ne serait jamais dite récurrente. Question posée à Grégoire : la copie qui n'évalue pas le critère **interrompt-elle** la récurrence, ou est-elle **sautée** (la récurrence se compte sur les copies qui l'évaluent) ? Recommandation de Cowork : **sautée** ; seule une copie où le critère est ACQUIS arrête le compte ; une copie dont l'échelle n'a pas de repères est sautée elle aussi (elle ne dit rien, dans un sens comme dans l'autre). Attends sa réponse avant de fusionner.
