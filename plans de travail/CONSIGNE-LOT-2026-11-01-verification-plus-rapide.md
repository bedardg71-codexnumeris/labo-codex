# Consigne – Une vérification plus rapide : remplir la condition de la bascule vers GitHub, et chronométrer le démarrage (1er novembre 2026)

> Écrite par Cowork le dimanche 1er novembre 2026 à 5 h 55 (Toronto, mesuré par `date`), sur `main` = `da7f83a4`.
> **Demande de Grégoire** (5 h 33) : la vérification complète du Mac prend environ 1 h 30 ; il ne fait plus qu'une mise en ligne par jour et veut pouvoir en faire plusieurs. Il a retenu la recommandation de Cowork (5 h 41) : finir la bascule du verdict vers GitHub, déjà inscrite (#1114). Sur sa question d'une refactorisation (5 h 46), Cowork recommande de chronométrer le démarrage avant d'en parler ; Grégoire a demandé d'ajouter cette mesure (5 h 53).

## 0. Avant tout : cette consigne tourne EN PARALLÈLE

- Une autre session travaille dans le dossier principal (les deux lots d'Annoter, groupe du 1er nov.). **Travaille dans ton propre worktree**, sur une branche partie de `main`. Première chose : crée le worktree, déplaces-y cette consigne (elle n'est pas suivie par Git : un simple `mv`), puis un commit de docs seul sur ta branche.
- **Aucune fusion vers `main` avant la mise en ligne de ce soir.** Ensuite : rebase sur `main` ; ta branche part avec la vérification complète suivante (elle touche les outils du verdict, le report de jeton de `verdict-en-morceaux.mjs --reporter` ne s'applique pas).
- **Jamais deux passes Playwright lourdes en même temps sur le Mac** (16 Go) : rien de lourd pendant la vérification complète de ce soir ni pendant une passe de l'autre session. Une spec seule, oui.
- Rien à demander à Grégoire dans ce lot, sauf si le rekey change un verdict.

## 1. Ce que Cowork a mesuré (1er nov., dans le dépôt)

- La suite : 239 essais le 2 sept. ; 784 le 16 oct. (~45 min) ; 1 220 le 31 oct., de 21 h 41 à 23 h 18 en dix morceaux (`scripts/.verdict-playwright.json`). Environ 30 essais de plus par jour de travail depuis deux semaines. `workers: 1`.
- Durée moyenne par essai sur le Mac : ~2 s en septembre (en-tête de `.github/workflows/tests.yml`, point 4a), ~3,4 s le 16 oct., ~4,8 s le 31 oct. **Inférence, pas mesure** : le nombre d'essais n'explique pas tout l'allongement.
- `index.html` charge 232 scripts, 12,2 Mo de JS, sans `defer` ni `async` (193 scripts le 2 sept.). `scripts/construire-publication.mjs` copie sans regrouper ni minifier : l'iPad charge la même chose.
- 772 appels `waitForTimeout` dans `tests/integration/`, 769 s si on additionne les délais écrits. **Estimation** : un appel dans une aide peut tourner plusieurs fois, un autre jamais.

## 2. Lot A : la condition de la bascule (#1114, verdict de Cowork du 29 oct.)

- L'identité d'un essai (`scripts/rapport-playwright.mjs`, `identite(fichier, titre)`, trois sites d'appel) ne porte pas le nom de son bloc `describe`. Fais-lui porter le chemin complet des blocs.
- Rekeye les deux baselines (`scripts/playwright-baseline.json`, `scripts/playwright-baseline-linux.json`). Vérifie que `EXCLUS_WEBKIT_LINUX` (`tests/playwright.config.js`) et le cliquet `tests/unit/sentinelle-ci-paths-ignore.test.js` (bloc 3) tiennent toujours.
- Aucune entrée ne doit apparaître ni disparaître : compte avant et après, et dis-le.
- Rejoue le juge sur le dernier rapport complet de GitHub et sur un rapport du Mac : même verdict qu'avant le rekey, sinon explique chaque écart.
- Contre-épreuve (skill `verification-adverse`) : deux essais de même titre dans deux blocs différents d'un même fichier, l'un rouge, l'autre vert. Avant ton changement, le juge les confond ; après, non.
- Compte les pushs conformes au critère de #1114 depuis le 25 oct. (0 sur 3 ce jour-là) et dis le compte.

## 3. La mesure du démarrage : mesurer, ne rien corriger

But : savoir quelle part de la vérification est le démarrage de l'application, que chaque essai repaie. Grégoire a demandé si une refactorisation aiderait ; la réponse attend ces chiffres.

- **M1, l'ouverture.** Sur le Mac, WebKit : de `page.goto(index.html)` jusqu'au signal de « prête » qu'attendent la majorité des specs (identifie-le et nomme-le) ; 20 ouvertures, médiane et extrêmes. Puis la même mesure sur `publication/` construite par le script, pour confirmer qu'elle ne diffère pas.
- **M2, les parts.** Sur les durées par essai d'une passe complète (le rapport fusionné de la dernière, s'il est gardé ; sinon fais en sorte que `verdict-en-morceaux.mjs` le garde, hors dépôt, et prends la première passe complète qui suit ta fusion) : la durée totale, les 20 fichiers les plus longs, le nombre réel d'ouvertures de l'application par passe, et donc la part du démarrage (ouvertures × M1).
- **M3, les pauses fixes.** Le temps réellement passé dans `waitForTimeout` sur une passe : instrumenté, pas additionné à la lecture.
- Livrable : `plans de travail/RAPPORT-2026-11-01-duree-de-la-verification.md`, trois parts en minutes (démarrage, pauses fixes, le reste), chacune marquée « mesurée » ou « estimée ». **Aucun correctif de l'application ni des specs dans ce lot** : Cowork lit les parts et recommande à Grégoire.

## 4. Ce qui vient ensuite : NE PAS le faire dans ce lot

Le lot B, que Cowork écrira quand le critère de #1114 approchera. Netlify publie `main` dès le push : le verdict de GitHub devra se rendre avant `main` (branche ou pull request ; aujourd'hui Playwright est sauté sur `pull_request`, job `decision`). Côté Mac, une passe courte des essais que Linux ne juge pas (6 exclus, 22 rouges connues, 28 intermittentes, lus depuis leurs listes) remplacera la suite entière dans `scripts/pousser.sh`. Si ton lot rencontre quelque chose qui rendrait ce lot B impossible, dis-le en tête du rapport.

## 5. Le rapport

En gestes et en durées, pas en numéros. Trouvailles hors lot : inscrire est le défaut. Noms fictifs uniquement (règle 6 de `CLAUDE.md`).
