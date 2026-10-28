# Demande de relecture – L'Aide, lot 3, la retouche (#1152)

> Claude Code, mercredi 28 octobre 2026, 14 h 30 environ, sur `main` (base `9e827b0e`). Verdict : `VERDICT-RELECTURE-2026-10-28-aide-lot-3.md` (Cowork, 14 h 15). Commit de la retouche : `66921d19`. Non poussé, pas de release, pas de verdict Playwright complet.

## En bref

- **Retouche 1 faite** : « Codex (le fichier) » dit « dans le menu Codex, en haut de l'écran ». Plus aucune définition du glossaire ne dit « en haut à gauche » ni « en haut à droite » (vérifié par le banc).
- **Retouche 2** : la définition de SRPNF était déjà posée mot pour mot ; son texte n'a pas bougé. La validation (« Validé par Grégoire le 28 oct. 2026, 14 h 15 (« on garde »), mot pour mot ») est notée dans le commentaire de l'entrée `srpnf` (`js/accompagnement-contenu-terme.js:593`).
- **Hors retouche, mais du lot 3** : les jetons anti-cache. Voir « Trouvé en chemin ».
- Tests : Vitest complet, depuis `tests/`, **842 fichiers, 10 092 sur 10 092** (10 091 + 1 essai neuf). Playwright non rejoué : aucun banc Playwright ne cite ces deux définitions (`grep` sur `tests/integration/`).

## La sentinelle

`tests/unit/sentinelle-aide-2026-10-28-lot-3.test.js`, un essai neuf : la définition du codex contient « en haut de l'écran », aucune définition ne nomme un côté, la définition de SRPNF est égale au texte validé, et le commentaire de l'entrée porte la validation.

**Break-test** : 3 mutations, 3 rouges (« à gauche » remis ; le commentaire retiré ; « ton nombre » devenu « le nombre »). Fichier restauré, identique à la copie (`cmp`).

## Ce que j'ai supposé

- Le verdict dit « le commentaire du terme » : l'entrée `srpnf` n'en avait pas, je l'ai posé au-dessus de `terme:`, comme le commentaire qualifiant de `codex`.

## Trouvé en chemin

**Corrigé maintenant, parce que c'est le lot 3 qui l'avait laissé** : le commit `4ec64491` avait posé `css/accompagnement.css` et `js/accompagnement.js` à `?v=20261028a`, alors que le build est `1027-1907`. La sentinelle `sentinelle-anticache-fichiers-modifies.test.js` était rouge à `9e827b0e` pour ces deux fichiers (mesuré : ils figuraient dans l'échec avant que je les touche) ; je ne sais pas quand le « 10 091 sur 10 091 » de la demande du lot 3 a été mesuré. Le hook pre-commit a refusé la retouche pour la même raison et proposé `?v=20261027a` pour `accompagnement-contenu-terme.js`. Les trois jetons sont maintenant à `20261027a` (jamais servis pour ces fichiers, vérifié dans l'historique d'`index.html`) ; la sentinelle repasse au vert. `version.json` n'est pas touché.

## Le geste à vérifier à l'écran après la mise en ligne

Aide › Référence, le glossaire, la fiche « Codex (le fichier) » : elle dit « dans le menu Codex, en haut de l'écran ».
