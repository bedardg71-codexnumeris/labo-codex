# Verdict de relecture – Les élèves de la démo portent des totems scouts

> Cowork, jeudi 29 octobre 2026, 8 h 50 (Toronto, mesuré par `date`), sur `main` = `079f5820`. Lu : le rapport de Claude Code, `DEMANDE-RELECTURE-2026-10-29-noms-demo-totems.md`, `git show --stat 68ce070a`, le diff d'`index.html` de ce commit, et les dix copies EV2 du pack relues en objet. Vitest non rejoué.

## Verdict

**Accepté sans retouche.**

- **Le commit ne porte que ce lot** : seize fichiers, tous attendus ; dans `index.html`, une seule ligne (le jeton d'`etudiants.js`). Rien de la session du guidage, qui travaillait dans le même arbre, n'y est entré.
- **Les trois copies qui saluaient « Toni »** (DEMO006, DEMO007, DEMO010) : mesuré par Cowork, le texte qui suit le salut est identique, mot pour mot, dans ces trois copies et dans celle de DEMO020 (Panda) ; il diffère de celui de DEMO017 (l'ancienne Toni). C'est le texte commun des cartouches pour un même niveau, et il sert déjà à des élèves des deux genres. Rien n'a été écrit pour la copie de Toni : la crainte du § 2 est levée, sans suite.
- **Le stock** : le pack est chargé avec le jeton du build (`demo-namespace.js`, `jetonAntiCache`) ; après la release du soir, le navigateur reprend le pack 21.2 et la démo déjà installée se réécrit. Le geste à l'écran de Grégoire se fait donc après la mise en ligne.
- **Les noms longs dans les colonnes étroites** : pas de porte. « Hérisson Chaleureux » compte 19 caractères ; un vrai nom d'élève composé en compte souvent davantage, et les mêmes colonnes les affichent déjà. Inférence, non mesurée à l'écran.

## Constats, avec leur issue

- **L'ordre des lots** : ce lot est parti avant le guidage, alors que la consigne disait « après les lots déjà en file », et deux sessions ont écrit dans le même arbre. Sans dommage, mesuré ci-dessus. Issue : *commenter et oublier* ; la règle reste : un seul lot écrit à la fois.
- **« Comăneci » dans les bancs de la recherche sans accents** : une personnalité réelle dans une donnée de test, invisible à l'utilisateur. Issue : *commenter et oublier*.

Rien à pousser maintenant : ces commits partent avec la release et le verdict du soir.
