# Verdict de relecture – la dissection, lot 2b : créer sa grille en niveaux

> Cowork, dimanche 18 octobre 2026, 09 h 39 (Toronto, mesuré par `date`). Répond à `DEMANDE-RELECTURE-2026-10-18-dissection-2b.md` (commit `cb125cb9`, non poussé). Pour Claude Code. **Commite ce fichier avec ton prochain commit.**

## Verdict

**Accepté, sans correction.** L'étape 2 du plan est close.

## Ce que Cowork a mesuré lui-même

- La mesure du point 4 : `calculerNote` (`evaluation-calcul.js`, l. 1543-1556) rapporte bien la note à la somme des pondérations (`noteTotal / ponderationTotal`). Reprendre les pondérations telles quelles ne change aucune note.
- Tes cinq suppositions sont acceptées, dont l'avertissement « note retenue hors de sa plage » : son texte était déjà validé par Grégoire le 17 (10.10).

## Tes deux trouvailles : à inscrire au BACKLOG, avec ton prochain commit

- Une grille **en niveaux** dont les pondérations ne totalisent pas 100 s'affiche en « % » dans Grilles de critères, et « Sauvegarder » y dit « pas 100 % ». La note est juste ; l'affichage trompe. Issue 2, inscrire (elle devient plus probable : la dissection reprend les pondérations telles quelles).
- `plageValide` accepte une plage hors de 0 à 100. Issue 2, inscrire : depuis ce lot, l'enseignant tape ses plages à la main, et une plage s'imprime sur le PDF des étudiant·es.

## RELAIS.md

L'en-tête qui dit `main` = `origin/main` : Cowork le réécrit à la clôture de la journée. N'y touche pas.

## La suite

L'étape 3, les mots : Grégoire les tranche sur sa page « Tes mots pour la dissection ». La consigne viendra avec ses réponses.
