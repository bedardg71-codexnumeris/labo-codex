# Verdict de relecture : la fusion des trois lots (vérification plus rapide, pauses après ouverture, pauses les plus lourdes)

> Cowork, vendredi 6 novembre 2026, 9 h 32 (Toronto). Relu : `git diff origin/main..main` à `9b0da7c8` (229 fichiers), en particulier `9b0da7c8` et `d1390edd`. Aucune relecture de Cowork n'existait pour ces trois lots : celle-ci les couvre tous.

## Verdict

**Accepté, avec une retouche avant le verdict complet** : la façon dont la sentinelle compte les pauses (§ 2). Le reste part tel quel. Ordre : retouche et `RELAIS.md` maintenant (Vitest seul), verdict complet ce soir au signal de Grégoire, push si vert.

## 1. Ce qui a été mesuré, et tient

- **L'application n'est pas touchée.** Hors `tests/` et `plans de travail/`, le diff ne nomme que `BACKLOG.md` et cinq scripts de mesure et de jugement (`git diff --stat origin/main..main -- . ':!tests' ':!plans de travail'`) : aucun `js/`, `styles.css` ni `index.html`.
- **Les fusions n'ont rien défait de `main`.** 17 fichiers touchés des deux côtés depuis la base `f302d833` (`comm -12` des deux listes). Dans les 13 specs communes, toute ligne changée par rapport à `origin/main` est une pause, une attente, un import ou un marqueur `pause-gardee` (filtre sur `git diff -U0`).
- **Le juge ne déplace pas la baseline du Mac.** Ses 4 entrées (`temoin-enregistrement-lot-b`) sont hors de tout `describe` (lignes 236 à 462) : l'identité à blocs leur rend la même chaîne. Aucun commit de `main` depuis la base ne touche les baselines ni les juges (`git log f302d833..origin/main -- scripts/playwright-baseline*.json scripts/rapport-playwright.mjs scripts/verdict-en-morceaux.mjs .github` : vide).
- **`9b0da7c8`** : les 5 conversions suivent un `goto` ou un `reload`, comme la règle le demande ; chaque contre-épreuve (`mutations-fusion.json`) casse ce que sa spec vérifie.
- **`d1390edd`** : l'exclusion se fait par fichier (`temoin-enregistrement.js:`), et ce fichier ne pose aujourd'hui qu'une minuterie, ligne 160 (`grep -n setTimeout js/temoin-enregistrement.js`). Juste tant qu'il n'en pose pas d'autre. *Commenter et oublier* : une phrase dans le commentaire de l'aide, au passage de la retouche.
- **La règle des constats d'absence est tenue.** 28 endroits où une attente précède directement une assertion négative, sans pause gardée entre les deux : relus un à un. Tous lisent l'état d'un rendu (un bouton absent d'une fiche existante, une chaîne masquée, une fenêtre fermée par Échap, une case décochée) ; aucun ne constate qu'une écriture ou un message n'a pas eu lieu.

## 2. La retouche : ce que la sentinelle compte dépend de la place d'une accolade

**Mesuré** (un script qui reprend la détection de `tests/unit/sentinelle-pauses-apres-ouverture.test.js` sur `tests/integration/`) :

- La sentinelle tient pour « enveloppe » toute fonction dont la première pause précède la première `}` du corps (`[^}]*?` dans `enveloppes()`), et compte alors chaque **appel** comme une pause. Dans `demarrer()` de `ajouter-pages-photo-droite` et de `reunir-en-une-copie-1231`, la conversion a placé une `}` (celle du `page.evaluate`) avant la pause qui reste, `waitForTimeout(3000)` après `activerModeDemo()` : les appels ont cessé de compter. D'où « −15 pour 5 lignes », alors que chaque appel attend toujours 3 s.
- Sur toute la suite : **44 fonctions** sont vues comme enveloppes ; **82 autres** contiennent une pause sans être vues, pour **308 appels** non comptés (`ouvrirParLaCase()` ×16 dans `codex-1012-ancien-zip-par-la-case`, `ouvrirDansEvaluer()` ×15 dans `evaluer-relit-la-grille-1215`, `ouvrir()` ×12 dans `evaluation-961-…`). Qu'un appel compte ou non tient à une accolade, pas à ce que l'essai exécute.

**Issue : finir le lot.** La sentinelle est de ce lot (écrite le 1er nov., jamais poussée).

**Décision de Cowork (technique) : le cliquet compte des SITES, les endroits du source où un délai est écrit.** Une enveloppe n'est plus qu'une fonction dont le corps entier est la pause (`const pause = (page, ms) => page.waitForTimeout(ms)`, ou une `function` dont le seul énoncé est ce `return`) : ses appels sont des sites, puisque le délai s'écrit à l'appel. Une fonction plus longue qui contient une pause compte pour sa ligne, une fois, et ses appels ne comptent pas. Motif : compter les appels de toutes les aides ferait rougir chaque spec neuve qui réutilise une aide existante, et c'est le source qu'on veut tenir.

**À faire :**
1. La détection d'`enveloppes()` selon cette règle.
2. Un banc de plus dans « Le cliquet voit ce qu'il doit voir » : une fonction de plusieurs lignes compte 1, avec ou sans `}` avant sa pause, quel que soit le nombre de ses appels ; une enveloppe d'une ligne compte ses appels.
3. Le plafond descendu au nouveau compte, et son commentaire réécrit : « recompté le 6 nov. selon la règle des sites », sans « pas un relèvement » (692 → 738 en était un, justifié par les specs de `main`).
4. Contre-épreuve : une pause ajoutée dans une aide de plusieurs lignes fait rougir ; retirée, reverdit. Vitest seul suffit, aucune spec Playwright n'est touchée.

## 3. La suite des pauses

**Pas de lot neuf avant la mesure de ce soir** (`node scripts/mesurer-verification.mjs` sur la passe complète) : les 5,6 min sont une estimation. Si la mesure les confirme, le candidat n'est pas la longue traîne mais **une famille** : la pause après `activerModeDemo()`. 21 specs, 3 s le plus souvent, environ 56 essais (comptés par `test(` en début de ligne), soit de l'ordre de 2 à 3 min au Mac (inférence : chaque essai n'appelle pas forcément l'aide). `page.evaluate` attend la promesse d'`activerModeDemo()` (asynchrone, `js/demo-activation.js:235`) : l'activation est finie quand la pause commence. Une règle, une famille, comme le lot des ouvertures. Cowork tranchera sur la mesure.

## 4. Les restes

- **`RELAIS.md`** : à réécrire dans le commit de la retouche (`main` fusionné en local, en attente du verdict de ce soir, puis du push). C'est le seul point que toute session lit.
- **Les worktrees et les branches des trois lots** : à retirer après le push ; leur contenu est dans `main` par les commits de fusion. La note de reprise du 2 nov. part avec son worktree, le rapport la remplace.
- **L'arbre de `main` porte des modifications qui ne sont pas du lot** (`.claude/settings.json`, `CONSIGNE-DEMARRAGE-COWORK.md`, sept fichiers de `plans de travail/`) : ne pas les mêler au commit de la retouche, ajouter par chemin.

## 5. L'ordre

Retouche et `RELAIS.md` (un commit) → verdict complet ce soir, au signal de Grégoire (Chrome, Safari et l'app Claude fermés, sur secteur) → push si vert → `mesurer-verification.mjs`, la mesure remplace l'estimation dans le rapport → worktrees retirés.
