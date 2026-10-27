# Verdict de relecture – Le tri de Git (#1114, branche `tri-git`)

> Cowork, mardi 27 octobre 2026, 02 h 51 (Toronto, mesuré par `date`). Relu : `main...tri-git` (`646ad3ce` à `259dd71b`, 8 fichiers), la demande de relecture, le diff de `tests.yml`, de la baseline Linux et de `morceau-playwright.mjs`, et dans `verdict-en-morceaux.mjs` les conditions du report, les gardes et les suppressions de fichiers (seulement ses dossiers `mkdtemp`). `main` = `970a3b91` (#1172 commité à 21 h 58, en attente de sa propre relecture, non poussé).

## Verdict : accepté, sans retouche

**A.** La cause est mesurée là où elle est (l'étape apt, pas la suite) et la correction ne touche ni le plafond ni le nombre de morceaux. La boucle est saine : `timeout` borne l'essai, `pkill` et `dpkg --configure -a` libèrent le verrou, le miroir d'Azure sort de la liste après un raté, et trois ratés disent NON JUGÉ au lieu de juger à faux. Non éprouvée sur un runner : assumé, le premier push le dira.

**B.** Le script fait ce qui se faisait à la main, sans toucher au juge ni au crochet. Les gardes refusent plutôt que de juger autre chose que le commit. Les break-tests couvrent les gardes qui comptent.

**C.** Les deux suppressions faites sont dans le geste permis (`git branch -d` refuse ce qui n'est pas fusionné).

## Les deux questions

1. **`lot-a` (c)(d) : « environnement », gardé.** La baseline Linux recense ce qui rougit sûrement sous Linux et passe sur le Mac ; rouge 4 fois sur 4 dans deux runs, elle y a sa place, quel qu'en soit le mécanisme. Le champ qui change d'un essai à l'autre désigne une course (la même famille que `lot-e3`) : c'est une piste pour la réparation (#1115, #1116), pas une raison de la sortir. La sortir ferait rougir chaque run pour une non-régression connue.
2. **La condition 1 plus stricte : gardée.** Elle ne peut que faire rejouer la suite plus souvent, jamais reporter un vert à tort.

## Les trouvailles : leur issue

- **`comparerALaBaseline` compte « redevenue verte » une entrée non jouée** : *inscrire et continuer*, rattachée à #1114 (elle a faussé le jugement à la main du 26, qui fait partie de ce chantier). À corriger au prochain lot qui touche le juge : n'est « redevenue verte » qu'une entrée présente et verte dans le rapport.
- **Trois rouges instables par run garderaient GitHub rouge** : *inscrire et continuer*, rattachée à #1114. Le critère de bascule devra dire ce qu'il fait d'une instable ; Cowork le proposera au retour du premier run complet.
- **Erreur de Cowork, pas de Claude Code** : la consigne disait trois copies « prunable ». C'est ce que `git worktree list` affiche depuis le montage de Cowork, où les chemins `/Users/…` n'existent pas : **toutes** y paraissent « prunable », `tri-git` comprise. Claude Code a mesuré juste et n'a pas lancé le prune. Règle pour Cowork : l'état d'une copie de travail se mesure sur le Mac, jamais depuis le montage.

## Les gestes proposés en C : décidés par Cowork

Technique, et sans perte possible : tout le contenu est dans `main` (`git cherry` vide), les copies sont propres, et `git worktree remove` (sans `--force`) comme `git branch -d` refusent d'eux-mêmes s'il restait quelque chose.

- **Autorisés** : `git worktree remove` puis `git branch -d` pour `fix-anonymisation`, `tampons-doigt` et `verdict-morceaux-2` ; `git push origin --delete ci/verdict-morceaux-2`. S'il en refuse un, tu t'arrêtes pour celui-là et tu le dis.
- **Dependabot : les dix PR restent ouvertes**, rien de fusionné ce soir. Les cinq actions GitHub feront un lot à part, sur une branche, avec un run complet à la demande ; Playwright 1.64 et Vitest 5, chacun le sien, un soir où aucune autre session ne teste. Pas d'item au BACKLOG : les PR en sont la trace.

## La suite, pour la session `tri-git`

1. Les gestes autorisés en C.
2. Déplace ce verdict (`mv`) du dossier principal vers ta copie, et commite-le sur `tri-git`.
3. **La fusion dans `main`, seulement si l'autre session de Claude Code est au repos** (mesuré par Cowork : rien d'écrit dans le dossier principal depuis 21 h 58). `git merge --no-ff tri-git` dans le dossier principal ; les fichiers non commités de Cowork qui s'y trouvent (`CONSIGNE-DEMARRAGE-COWORK.md`, le plan du critère, deux fichiers de l'étape 4) ne sont pas à toi : n'y touche pas, ne les commite pas. **Pas de push** : `main` porte #1172, que Cowork n'a pas encore relu, et la mise en ligne se fait le soir, après la vérification complète, au signal de Grégoire.
4. Sur `main`, dans un commit de docs : les deux trouvailles rattachées à #1114 (BACKLOG) ; le script nommé dans le skill `fin-de-session` (§ 4.5) et dans la consigne de mise en ligne, **avec la procédure à la main gardée en repli** pour sa première course ; une entrée de `RELAIS.md`.
5. Retire ta copie et la branche `tri-git`, une fois fusionnée.

**Ce soir** : la vérification complète se joue pour la première fois par le script. S'il refuse ou casse, la procédure à la main reprend, et le refus va dans le rapport. Le push qui suivra sera le premier run de GitHub à traverser l'étape apt bornée.
