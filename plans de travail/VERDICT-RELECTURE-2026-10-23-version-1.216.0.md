# Verdict de relecture – la version 1.216.0

> Cowork, vendredi 23 octobre 2026, 10 h 52 (Toronto, mesuré par `date`). Relu : `d04f8324` et `56f7be93` (non poussés) ; la demande `DEMANDE-RELECTURE-2026-10-23-version-1.216.0.md` et le rapport de Claude Code (10 h 41).

## Verdict : acceptée, prête pour le verdict complet

- **Les Nouvelles 1.216** (`56f7be93`, `js/changelog-data.js`). Titre et deux items conformes, mot pour mot, à la validation de 10 h 36 ; seules les apostrophes sont courbes et les insécables en `&nbsp;`, comme dans la 1.215. Acceptée.
- **La version.** `version.json`, `version.js`, les deux valeurs d'`init-inline.js` et le snapshot de `main.js` disent 1.216.0, build `1023-1037` ; `git grep` de `1022-1833`, `10221833` et « 1.215.0 » hors `*.md` sur `56f7be93` : zéro.
- **Les jetons anti-cache.** Les treize fichiers de `js/` modifiés depuis la 1.215.0 (`git diff --name-only 628a7657 56f7be93 -- js`) portent tous `?v=20261023a` dans `index.html`, y compris les deux neufs (`palette-algo.js`, `comptes-erreurs-stock.js`) et `evaluation.js`.
- **`ComptesErreurs.verifier()`** n'écrit rien sans `{ reparer: true }` (`js/comptes-erreurs-stock.js`, ligne 284 : retour avant toute écriture) ; la réparation exige en plus un Codex à jour. Conforme à « on mesure, on sépare, on propose ».
- **Hors commit, à raison** : la demande de relecture et la ligne de l'étape 2b du plan, pour que la release reste le dernier commit jugé par le verdict.

## Une trouvaille, troisième issue

Le commentaire de la 1.215 dans `js/changelog-data.js` a perdu son espace (`// 1.215(le critère…`). Commentaire seul, sans conséquence observable : **commenter et oublier** ; à remettre à la prochaine écriture des Nouvelles, pas maintenant (toucher `js/` changerait l'arbre que le verdict juge).

## Ensuite

Le verdict complet et le push, au signal de Grégoire : `CONSIGNE-DU-JOUR.md` (10 h 52).

**13 h 27 : reporté.** Grégoire fait passer #1144 (la cartouche qui remplace les critères de la grille) avant le verdict ; la consigne de 10 h 52, non exécutée, est archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-23-verdict-1.216.0-reporte.md`. La release qui sera jugée sera celle qui suit #1144.
