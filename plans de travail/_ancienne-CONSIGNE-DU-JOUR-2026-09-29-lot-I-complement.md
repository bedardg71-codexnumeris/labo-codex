# Consigne du jour – lot I, complément avant 1.170.0 (#985)

> Écrite le 29 septembre 2026 à 20 h 50 (Toronto) par Cowork. Suite de `plans de travail/CONSIGNE-LOT-I-rappel-codex.md`. Relecture de Cowork : `plans de travail/RELECTURE-2026-09-29-lot-I-rappel-codex.md` (verdict « à compléter »).
> **Condition de départ** : `git --no-optional-locks log --oneline -1 lot-i-rappel-codex` montre `2efa12cf` ou plus récent. Même branche, même worktree.

## 1 · Le délai choisi ne doit pas survivre à son usage (technique, tranché par Cowork)

`delaiApresMiseAJour` n'est jamais remis au défaut : 30 jours choisis dans le rappel, mise à jour échouée ou annulée, puis mise à jour réussie par le menu dans la même page → report de 30 jours au lieu de 14.
- Remets-le à `DELAI_PAR_DEFAUT` dès qu'il a servi, dans `reporterApresMiseAJourDuCodex`, y compris quand le report est écarté (« Ne plus rappeler », date plus lointaine), et à chaque ouverture du rappel.
- Banc : 30 choisi → échec → mise à jour réussie par le menu → 14 jours. Break-test : sans la remise à zéro, l'essai rougit.

## 2 · La carte de l'Accueil devient celle du codex (Grégoire, 29 sept. à 20 h 49, option a)

`js/accueil.js` l. 235-240 : titre « Ton codex », sous-titre « Mets-le à jour : une copie complète de tes données. » – mots acceptés tels quels. Le geste ne change pas (`ouvrirModalBackup`). L'icône : à toi. Une sentinelle des mots : l'ancien titre « Copie de secours » n'est plus sur la carte.

## 3 · Les Nouvelles de 1.170.0 (Grégoire, 29 sept. vers 20 h 50, « Oui, telle quelle »)

- **Titre** : « Le rappel te propose de mettre ton codex à jour »
- **Ligne** : « À l'ouverture, le rappel te propose maintenant de mettre ton codex à jour, au lieu de faire une copie de secours. Après une mise à jour réussie, ou si tu le fermes par la croix, il ne revient pas avant 14 jours. Sur l'Accueil, la carte « Ton codex » y mène aussi. »

Mot pour mot. Version mineure, par `scripts/release.mjs`.

## 4 · Ce qui est dû, dans l'ordre

1. Commit du complément sur la branche ; Vitest complet ; le banc `lot-i-rappel-mene-au-codex` vert.
2. La porte terrain (`PORTES-TERRAIN-2026-09-29-lot-I-rappel-codex.md`) reçoit une rangée : sur l'Accueil, la carte « Ton codex » ouvre « Mets ton codex à jour ». Préalable écrit « 1.170.0 ou plus récent ».
3. Release 1.170.0, fusion dans `main`, verdict WebKit complet (Cowork fermé, couvercle ouvert), puis `pousser.sh`, puis « en ligne » chez Netlify.
4. **Case à cocher : aucune.** #985 reste ouverte à dessein : la disparition de la copie de secours (D9) est le lot suivant. Note sous #985 : « Lot I livré en 1.170.0 (rappel, carte de l'Accueil) ; reste D9. »
5. `RELAIS.md` à jour ; la liste des fichiers de Cowork à commiter : `plans de travail/RELECTURE-2026-09-29-lot-I-rappel-codex.md`, `plans de travail/CONSIGNE-DU-JOUR.md`, `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-29-lot-H-duree-suite.md`, `plans de travail/CONSIGNE-LOT-I-rappel-codex.md`, `plans de travail/PLAN-2026-09-29-fin-carte-et-enregistrement.md`, `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-29-lot-F-les-mots.md`, `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-29-lot-G-codex-ipad.md`, `CONSIGNE-DEMARRAGE-COWORK.md`.
