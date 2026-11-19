# Rapport, 19 au 20 nov. 2026 (session de nuit B), lot 2 : « Nous faisons » de « Monter ton cours »

**Dernier relais.** Branche `lot/nous-faisons-cours`. Consigne : `plans de travail/CONSIGNE-2026-11-19-nous-faisons-cours.md` (le relais du 19 nov., mot pour mot, avec les deux changements du mandat de la nuit). EN COURS : les mesures préalables sont ci-dessous ; le code suit.

## 0. La base de l'aperçu (changement 1 du mandat)

- Partie de `origin/claude/ecstatic-brown-urn6v8` à **`ebc9a9ad`**, quoi qu'il existe d'autre (aucune branche `lot/nous-faisons-*` n'existait à 22 h 40 UTC). Sa session avait poussé son rapport (`RAPPORT-2026-11-17-je-regarde-recevoir.md`, sur la branche).
- **Fusion 1** : `git merge --no-ff origin/main` (`ade09e939`, la 1.250.0), commit `121e9b41`. Conflits tranchés en gardant les deux côtés : `index.html` (jetons `?v=` : `20261119w` pour chaque fichier dont le contenu fusionné diffère de `main`, commentaires réunis) et `BACKLOG.md` (le dernier ID de `main`, #1295, avec la mention de #1286 pris sur la branche ; les deux sections neuves l'une après l'autre).
- **Fusion 2** : `git merge --no-ff origin/lot/glisser-alignement` (**`465c2970`, la PR #34**, le correctif de #1295 mesuré sous WebKit ; voir le relais de la nuit : le lot 1 de cette session en est un double, gardé sur `lot/glisser-alignement-nuit-b`). Sans conflit.
- Ces deux fusions font partie de l'aperçu : elles en sortent avec lui.

## 1. Les trois mesures, avant le code

### (a) Le glisser d'une leçon dans le « Planificateur », au doigt : IL NE CHANGE PAS SA SEMAINE (mesuré sous Chromium ; WebKit non mesurable ici)

Sonde non gardée, carte de la démo, 1180 × 820, une leçon de « Non planifié » glissée sur la rangée de la semaine 7, toucher émulé (`hasTouch`, `Input.dispatchTouchEvent`, dix pas) contre la souris (mêmes points) :

| Geste | Ce que la page reçoit | La semaine |
|---|---|---|
| souris | `pointerdown`, 10 `pointermove`, `pointerup` | **7** |
| doigt, au milieu de la pastille | `pointerdown` (sur la pastille), puis **`pointercancel`** : le navigateur reprend le geste pour défiler | **inchangée** |
| doigt, à 14 px du bord gauche de la pastille | le toucher part sur la **poignée de la palette** (ajustement de la cible d'un toucher), pas sur la pastille | **inchangée** |

Cause lue dans le code : `initialiserDragGrille` (`js/planification-carte.js`) écoute les Pointer Events, mais rien ne pose `touch-action` sur la grille : au doigt, le défilement natif l'emporte et annule le geste (le commentaire d'août le disait : « souris d'abord ; le tactile … reste une porte ouverte »). **Rien n'est changé** : la bulle 7 dit « y glisser une leçon change sa semaine, et donc ses dates » ; c'est vrai à la souris, pas au doigt (mesuré ici sous Chromium, inféré pour l'iPad). **Cowork tranchera** (les mots de la bulle, ou le geste au doigt). Le mot est gardé tel quel. Porte : le vrai iPad (§ porte terrain).

### (b) La carte active est-elle rattachée au cours ? Le plus souvent oui ; trois cas où non (lu dans le code, non rejoué)

La date par groupe de la bulle 3 exige une carte rattachée au cours (sinon l'Inspecteur dit « Carte rattachée à aucun cours : pas de date »). Une carte reçoit le cours ACTIF au moment où elle est créée (`creerEntreeIndex`, `js/planification-donnees.js`) ; la première carte d'un trimestre naît à la **première visite** d'Alignement (`initialiserSiNecessaire`). D'où :

1. **Alignement ouvert avant que le cours existe** dans ce trimestre (une visite pendant « Mettre ta classe en place », entre le trimestre et le cours, ou une exploration avant) : la première carte reste sans cours.
2. **Une carte créée quand un autre cours était actif** : rattachée à cet autre cours (ses dates sont celles de l'autre horaire).
3. **Une carte plus ancienne que le rattachement** (`coursId`), ou importée d'un cours absent de ce codex : sans cours.

Dans le cas ordinaire du parcours (le troisième parcours fait, donc un cours actif, et Alignement ouvert pour la première fois par la bulle 1), la carte naît rattachée : la bulle 3 tient. Rien n'est ajouté.

### (c) La fin de la bulle 7 : DANS L'APERÇU, « TERMINER » SEUL

Le moteur offre « Parcours suivant » quand le parcours qui suit, dans le panneau, est OUVERT (`suivantDe`, `js/assistance.js`). L'ordre du panneau : … « Recevoir », « Monter ton cours », « Mettre tes données à l'abri » (`donnees`), … Sur cette base, `PARCOURS_OUVERTS` = `decouvrir`, `classe`, `evaluer`, `recevoir` (+ `monter`, ouvert sur la branche par un commit à part) : **`donnees` est fermé, son « Nous faisons » n'est pas dans la base**. La bulle 7 n'offre donc que « Terminer », et sa consigne suit ses boutons (`consigneDeLaFin`) : « Touche « Terminer » ». Dans les bancs, qui rouvrent tous les parcours, elle offre « Parcours suivant » et « Terminer », de même poids, et dit « Touche « Parcours suivant », ou « Terminer » ». Rien n'est inventé : quand le sixième parcours sera ouvert, l'aperçu dira les deux suites.

## 2. Le code

- **`js/parcours-cours.js`** : les sept étapes passent du paragraphe (`texte`, `geste`) aux lignes (`lignes`), mot pour mot depuis la consigne (bulles 1 à 7, et la seconde forme de la 6). Explications en `note` (sans marque), gestes en lignes de liste, consigne en dernier (`geste: true`).
- **La confirmation** (`confirme`), au-dessus du titre, à partir de la bulle 2 : une fonction qui rend le texte seulement si l'étape d'avant a été faite **pendant ce passage** (`debutDuPassage`, posé par `lancer` : 0 pour « Commencer » ou « Refaire », l'étape de la reprise pour « Reprendre »). Après « Reprendre », la bulle de la reprise ne confirme rien ; les suivantes, oui.
- **L'objectif et l'objectif atteint** sur la définition (`objectif`, `objectifAtteint`), posés par le moteur (bulle 1 ; bulle 7, entre deux filets).
- **La phrase du lieu** à la bulle 1 seulement (`lieu: true`, `lieuSuite: ": c'est là que tu construis ta carte d'alignement."`) : le moteur lit « Conception » et « Alignement » dans le menu et pose le halo. `nommeLaSection` n'est pas employé : la bulle ne parle d'aucune section de la page (la carte entière est le lieu).
- **La seconde forme de la bulle 6** : le mécanisme d'avant est gardé (`varianteRendue`, `M().allerA(5)`, qui rend la même étape de nouveau quand la pastille change), et `secondeForme` du moteur dit, dans cette forme-là, de retirer la confirmation. Choisi parce que c'est lui qui pilote déjà les contours et les zones de la variante ; `secondeForme` seul ne rendrait pas l'étape de nouveau.
- **La fin** : la bulle 7 garde `centre`, `sansSortie`, `surEchap` et le bouton « Terminer » (`terminer()` fait son ménage et l'état « fait ») ; sa consigne est « Touche « Terminer » », que le moteur récrit en deux suites quand il offre « Parcours suivant ». « Le guide t'accompagne à chaque pas. » est retirée.
- **Ce qui n'a pas changé** : la ligne du panneau, le refus, `grandEcranSeulement`, `enSaisie`, `neuf`/`noeudsAvant`, `amenerLeBloc`, `poserExtras`, `inspecteurDevant`, les titres, `avant`, `zones`, `contour`, `atteint`.
- Jeton `?v=` de `js/parcours-cours.js` : `20261119w` ; de `js/assistance.js` (le commit d'ouverture) : `20261119x`.

## 3. Les gestes qui se grisent, et ceux qui ne le peuvent pas

Chaque geste se grise par l'état de la carte, avec les lecteurs qui existaient : `duType`, `texte`, `leconNeuve`, `leconDatee`, `parent` (dans la leçon du parcours), `inspecteurOuvertSur`, `objectifsVerifiesPar`, `blocQuiSert`, `evaluationAlignee`.
- **Le badge 🎯** (bulle 4) : se grise quand la zone des objectifs de la leçon est à l'écran (lu dans la page, le badge l'ayant dépliée).
- **« Touche deux fois cette poignée »** (bulles 5 et 6) : se grise quand l'Inspecteur est ouvert sur le bloc ; s'il se referme, la ligne revient à faire (le moteur dégrise une ligne défaite).
- **Ne se grise pas** : la consigne de la fin, « Touche « Terminer » » (c'est un bouton qui la fait).

## 4. Ce que la forme demande et que la base ne permet pas : SIGNALÉ, PAS INVENTÉ

Le relais demande de n'employer que les mécanismes qui existent (le moteur, et ceux des autres « Nous faisons » s'ils sont dans la base ; ils n'y sont pas : la session A les écrit cette nuit sur ses propres branches).
1. **La flèche devant chaque geste** : le moteur de cette base ne pose la flèche (→) que devant la consigne (`parcours-bulle-ligne--geste`) ; un autre geste n'a rien avant d'être fait, puis son crochet. Les gestes sont donc reconnaissables par leur place dans la liste, pas par une flèche.
2. **La parenthèse hors du gras d'une consigne** (bulles 2, 3 et 4 : « (le lien « se décline en » s'affiche) », « (le lien « se concrétise dans » s'affiche) », « (l'invite « Sera en mesure de… » t'y aide) ») : la consigne est un seul texte, en gras ; la parenthèse y reste, en gras. Les mots sont exacts ; seul le poids diffère.
3. **Le point final de la consigne de fin** : le relais écrit « Touche « Parcours suivant », ou « Terminer ». » ; le moteur écrit cette phrase seul, sans point dans une liste (« le point final suit celui de la consigne d'origine ; une ligne de liste n'en porte pas »).
⮕ Quand les lots de la session A apporteront ces mécanismes, ce parcours les prendra à la fusion (une ligne par geste à marquer, la parenthèse à sortir du texte de trois consignes).

## 5. Les mots signalés (aucun n'a été changé)

- **Bulle 7**, piste « le « Planificateur », qui montre toutes tes leçons semaine par semaine ; y glisser une leçon change sa semaine, et donc ses dates » : vrai à la souris ; au doigt, la mesure (a) dit que non (sous Chromium). Cowork tranchera ; porte 2.1.
- **Bulle 3**, « sa date pour chacun de tes groupes » : vrai si la carte est rattachée au cours ; les trois cas où elle ne l'est pas sont à la mesure (b).

## 6. Les commits

| Commit | Ce qu'il fait |
|---|---|
| `121e9b41` | fusion de `origin/main` (la 1.250.0) : partie de l'aperçu |
| `c943fa9b` | fusion de `origin/lot/glisser-alignement` (PR #34) : partie de l'aperçu |
| `33d2b367` | la consigne |
| `725c6c6d` | ce rapport, avec les mesures, avant le code |
| `f43febe5` | la fusion recousue (trois jetons, une ligne d'`index.html`) |
| `026078ed` | le code et les bancs |
| **`52a12f6d`** | **APERÇU SEULEMENT : `monter` dans `PARCOURS_OUVERTS`. À ANNULER AVANT TOUTE FUSION** (`git revert 52a12f6d`) |
| `27bb4b20` | le registre des gestes proposés le 11 nov. : l'entrée de ce parcours retirée |

## 7. Les bancs et leurs break-tests

- **`tests/unit/sentinelle-parcours-cours-2026-11-09.test.js`**, réécrite (32 essais) : chaque bulle, lue à l'exécution, confrontée au relais de la consigne (titre, confirmation, explications et gestes dans l'ordre, une seule consigne et la dernière ; objectif et suite du lieu à la bulle 1 ; seconde forme ; objectif atteint ; les deux retouches) ; les gestes qui se grisent, sur la carte simulée ; la confirmation après « Reprendre ». Le panneau, le refus, le guide et ce qui fait avancer chaque étape : gardés. Les guillemets imbriqués du relais sont appariés (`citation`). Break-tests, par mutation : la condition du glisser (bulle 5) ramenée à « un bloc existe » → 1 rouge ; la confirmation toujours vraie → 1 ; « le vérifier » remis à « l'exiger » → 2 ; `secondeForme` retiré → 1 ; deux espaces en fin d'une explication → 1. L'ancienne sentinelle, sur le nouveau code : 9 rouges.
- **`tests/integration/parcours-5-nous-faisons-2026-11-19.spec.js`**, neuf, 1180 × 820 et 820 × 1180 : sur un espace où le troisième parcours est fait, la carte posée par son API (le geste lui-même reste jugé par `parcours-5-monter-ton-cours`), bulle par bulle : l'objectif et la phrase du lieu à la seule bulle 1 ; la confirmation (présente, puis absente à l'étape 4 rejointe par « Reprendre », puis présente à la 5) ; le classement (six explications et deux gestes à la bulle 1, la consigne en dernier) ; les gestes qui se grisent ; la seconde forme de la bulle 6 (sa phrase, son geste, sans confirmation) et le retour à la première ; la fin (objectif atteint, « Chaque parcours a son objectif… », « Pour revoir une étape, touche « 7 sur 7 ». », la consigne et les boutons du moteur) ; la bulle 7 dans la fenêtre. Break-tests : confirmation toujours vraie → rouge (l'étape 4 après « Reprendre ») ; `secondeForme` retiré → rouge (la seconde forme) ; le badge jamais fait → rouge.
- **`parcours-5-monter-ton-cours-2026-11-09.spec.js`** suit les lignes, sans rien perdre : la seconde forme se lit dans ses phrases et son geste, et il vérifie en plus qu'elle n'a pas de confirmation ; le retour à la première forme compte ses six gestes.
- `tests/unit/_helpers/gestes-proposes-2026-11-11.js` : l'entrée de ce parcours retirée (ses gestes sont ceux du 19 nov.).

## 8. Tests joués

- **Vitest complet, depuis `tests/`** : un seul fichier rouge au premier passage, `sentinelle-gestes-proposes-2026-11-11` (8 essais : il gardait les lignes de ce parcours proposées le 11 nov.) ; l'entrée retirée (`27bb4b20`), 34 sur 34. Sur la base fusionnée, avant le code, deux rouges de la résolution de la fusion (trois jetons, une ligne d'`index.html`), corrigés (`f43febe5`). Le crochet de poussée rejoue Vitest à chaque push.
- **Playwright Chromium, fichiers liés, aux deux tailles** (`parcours-5-monter-ton-cours`, `parcours-5-nous-faisons`, `essai-novice-lot2-moteur`, `vue-simple`, `registre-des-parcours`, `parcours-je-regarde-2026-11-16`, `parcours-fleches-2026-11-10`, `planif-glisser-relachement-1295`) : 1180 × 820, 75 verts et 3 rouges ; 820 × 1180, 76 verts et 2 rouges.
  - Le rouge de mon banc neuf (1180 × 820, essai à 820 × 1180) : un bloc posé avant que la carte ait fini de se charger. Le banc attend maintenant la carte, puis le bloc (`9a8b…` ci-dessous) : **6 verts sur 6** ensuite (trois passages, deux tailles).
  - Les autres, **rejoués sur la base sans ce lot** (`f43febe5`, arbre à part) : `parcours-fleches-2026-11-10` « la poignée : 46 px… » rouge aux deux tailles sur la base aussi ; « sous le zoom au pincement… » rouge à 820 × 1180 sur la base aussi ; `parcours-je-regarde-2026-11-16` « « Découvrir » : l'objectif à la première bulle… » rouge à 820 × 1180 sur la base aussi (une rotation lue pendant sa transition), et une fois à 1180 × 820 avec ce lot, vert sur la base : intermittent. **Aucun n'est attribuable à ce lot.** Non inscrits (ni vécus, ni bloquants : issue 2 de CLAUDE.md, à la décision de Cowork).
- **WebKit** : par GitHub, au push.

## 9. Supposé, non vérifié

- **Supposé** : `nommeLaSection` n'est pas employé à la bulle 1 (aucune section de la page n'y est en cause) ; la phrase du lieu se lit « Tu es dans « Conception », à l'onglet « Alignement » : c'est là que tu construis ta carte d'alignement. ».
- **Supposé** : la consigne de la fin sans point final (le moteur l'écrit ainsi dans une liste).
- **Supposé** : le jeton `w` (et `x` pour le commit d'ouverture), lettres qu'aucun lot du jour n'employait à 22 h 40 UTC.
- **Non vérifié** : Safari et l'iPad (WebKit absent du conteneur) ; le glisser au doigt dans le « Planificateur » sur un vrai iPad (porte 2.1).
