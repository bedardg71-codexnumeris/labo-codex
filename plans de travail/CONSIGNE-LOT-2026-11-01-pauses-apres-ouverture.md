# Consigne – Après une ouverture, attendre l'application, pas un délai (1er novembre 2026)

> Écrite par Cowork le dimanche 1er novembre 2026 à 7 h 30 (Toronto, mesuré par `date`) ; `main` = `f302d833` ; branche `lot/verification-plus-rapide` = `c1c1c204`, non fusionnée.
> **Source** : `plans de travail/RAPPORT-2026-11-01-duree-de-la-verification.md` (sur cette branche), relu par Cowork. Les pauses fixes font ~60 % de la vérification du Mac (~58 min sur 97,6 ; mesuré sur GitHub, estimé pour le Mac). **897 d'entre elles (22,8 min sur GitHub) suivent immédiatement une ouverture ou un rechargement**, alors que l'application est prête en 0,33 s.
> **Décision de Grégoire** (7 h 28) : ce lot.

## 0. Avant tout

- Une autre session travaille dans le dossier principal (les lots d'Annoter). **Travaille dans ton propre worktree**, sur une branche partie de `lot/verification-plus-rapide` : tu as besoin de `scripts/mesurer-verification.mjs`. Déplaces-y cette consigne (elle n'est pas suivie par Git : un simple `mv`), puis un commit de docs seul.
- **Fusion** : après la mise en ligne de ce soir, et après celle de `lot/verification-plus-rapide`. Ta branche part avec la vérification complète suivante.
- **Sur le Mac** : une spec à la fois, et rien pendant la vérification complète de ce soir. Pour une passe large, GitHub sur ta branche (`gh workflow run tests.yml --ref <ta branche>`), **à condition d'avoir vérifié qu'une branche poussée ne publie rien chez Netlify**. Sinon, pas de push : la passe large attend la fusion.
- Rien à demander à Grégoire : ce lot ne touche que des tests.

## 1. Le périmètre

- **Dedans** : les pauses (`waitForTimeout`) qui suivent une ouverture (`page.goto`) ou un rechargement (`page.reload`), dans les specs et dans les aides qui ouvrent l'application. Lecture de Cowork, non mesurée : 297 sites écrits dans les trois lignes qui suivent un `goto` ou un `reload`, dans 171 fichiers. **Le compte qui fait foi est celui de M3 (897 à l'exécution)** : trouve les sites réels depuis l'instrumentation, pas depuis ce grep.
- **Dehors** : les autres pauses (~2 000 à l'exécution), l'enregistrement de la trace (un arbitrage, pas un gain gratuit), le code de l'application.

## 2. La règle de remplacement

- Une pause fixe devient **une attente sur la condition dont l'étape suivante a besoin** : `window.dbReady === true`, l'élément qu'elle va toucher, l'état qu'elle va lire. Jamais une pause plus courte.
- **Ce que l'essai vérifie ne change pas** : aucune assertion modifiée, retirée ou affaiblie.
- Si une pause masquait une vraie attente de l'application (anti-rebond, animation, écriture différée), attends son effet observable. Si rien n'est observable, garde la pause avec un commentaire qui dit pourquoi, et compte-la au rapport.
- Mutualiser dans une aide partagée est permis si ça ne change pas la façon dont les autres specs tournent ; sinon, site par site.

## 3. La preuve

- Chaque spec modifiée, jouée au moins une fois sur le Mac (WebKit), verte. La répétition (`--repeat-each=3`) sur GitHub, sur ta branche ; si GitHub n'est pas possible, trois fois sur le Mac pour un échantillon de vingt specs de familles différentes.
- **Contre-épreuve** (skill `verification-adverse`), sur au moins dix specs de familles différentes : casse ce qu'elles vérifient, elles rougissent toujours. Une attente sur une condition qui ne vient jamais doit échouer par un dépassement, pas passer.
- **Aucune intermittente neuve.** Si des intermittentes de la liste Linux deviennent stables, dis lesquelles ; ne les retire pas toi-même (la règle de classement de la baseline s'applique).
- **Le gain**, par `scripts/mesurer-verification.mjs` : avant et après sur la passe large (nombre de pauses, minutes), puis sur la première passe complète du Mac qui suit la fusion.

## 4. Un cliquet, pour que ça ne repousse pas

- Un essai Vitest (`tests/unit/`) compte les `waitForTimeout` des specs : le nombre ne peut que baisser. Une pause écrite juste après un `goto` ou un `reload` le fait échouer directement, avec un message qui dit quoi écrire à la place.
- Contre-épreuve : ajoute une pause après un `goto` dans une spec, le cliquet rougit ; retire-la, il reverdit.

## 5. Le rapport

- En minutes et en gestes. Mets à jour les parts du rapport du 1er nov.
- **Pour le lot suivant** : les autres pauses classées par site, en minutes à l'exécution (les 30 plus lourds), pour que Cowork découpe la suite.
- Trouvailles hors lot : inscrire est le défaut. Noms fictifs uniquement (règle 6 de `CLAUDE.md`).
