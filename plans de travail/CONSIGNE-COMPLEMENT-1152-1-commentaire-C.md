# Complément au lot 1.152.1 (#908) – un commentaire à rendre vrai, puis le push

> Écrit le 21 septembre 2026, 9 h 43 (Toronto), par Cowork, après la relecture croisée de `ffd1368b` (verte pour le code ; détail en tête de `RELAIS.md`).

1. **Grégoire a tranché à 9 h 43 : le texte de C est le tien, tel que commité.** Il ne change pas.
2. Dans `js/trimestres.js`, le commentaire au-dessus de `description` dit « Mots de Grégoire, tels quels » : faux pour C. Remplace-le par une phrase vraie, par exemple : « description, A et P : mots de Grégoire, tels quels ; C : proposé par Claude Code, validé par Grégoire le 21 sept. 2026 ». Si la sentinelle #908 le dit aussi, même correction.
3. Aucun comportement ne change. `js/` touché : jeton anti-cache de `trimestres.js` selon la règle habituelle, build-only (numéro 1.152.1 inchangé si ta chaîne le permet), Vitest vert.
4. Commite ce complément avec `plans de travail/CONSIGNE-COMPLEMENT-1152-1-commentaire-C.md` et `RELAIS.md` (ajout de Cowork).
5. **Puis pousse, sur le mot de Grégoire donné ici** : `scripts/pousser.sh origin main` sous `caffeinate`, en arrière-plan, **Cowork fermé** (vérifie-le), `pgrep pousser.sh` vide. Corrige le bloc de `RELAIS.md` quand c'est poussé.
