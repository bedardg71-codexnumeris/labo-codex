# Module Pratiques de notation

> Remplacé le 11 octobre 2026 (#804). L'ancienne version (Beta 95, 1er janvier 2026) décrivait trois familles, `pan-maitrise`, le wizard Primo et un `GUIDE_AJOUT_PRATIQUE.md` qui n'existe pas. Un document de module faux vaut moins qu'un renvoi juste.

**Périmètre** : `js/pratiques/` (registre, quatre familles, assistant de configuration, Comparateur), avec `js/pratiques.js` et `js/pratiques-gestion.js` pour la bibliothèque et le formulaire de gestion. Les fichiers se comptent par `ls js/pratiques/`, ils ne s'inscrivent pas ici.

**Les quatre familles canoniques** : `sommative`, `standards`, `specifications`, `denotation`. Les anciens identifiants (`pan-maitrise`, `pan-standards`…) se résolvent au registre par `normaliserIdPratique` (`pratique-registre.js`).

**Où lire le reste, à jour :**

- Le moteur de calcul, la résolution d'une pratique, la simulation et ses pièges : le skill `.claude/skills/pratiques-notation/SKILL.md`.
- Qui écrit et qui lit chaque clé (`pratiquesConfigurables`, `modalitesEvaluation`…) : `docs/DATA-OWNERSHIP.md`.
- L'aperçu de l'architecture générale : le skill `labo-codex`, § 5.

**À ne pas croire** : `pratique-notation-v2.js` est chargé, mais ses 14 cibles n'existent plus dans la page (#469, remesuré le 11 oct. 2026). La grappe `calculerNoteFinale` de `pratique-configurable.js` n'a aucun appelant (#903) : la note passe par chaque famille.
