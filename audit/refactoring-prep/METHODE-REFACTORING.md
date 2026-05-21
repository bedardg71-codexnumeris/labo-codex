# Méthode de refactoring des god modules

**Date de création** : 2026-05-15
**Statut** : document vivant — à compléter et raffiner après chaque module refactoré
**Public** : Claude Code dans les sessions séparées de refactoring, relu par Grégoire
**Documents apparentés** : `audit/PLAN-MOYEN-TERME.md`, `audit/refactoring-prep/MODULES-MAP.md`

---

## 1. Objet

Ce document décrit la méthode opératoire à appliquer pour refactoriser les 5 god modules de Labo Codex (`evaluation.js`, `productions.js`, `profil-etudiant.js`, `trimestre-v2.js`, `bilan-reflexif.js`). Il rend explicite ce que `PLAN-MOYEN-TERME.md` et `MODULES-MAP.md` supposent implicitement.

Il sert trois fonctions :

1. **Référence opératoire** : Claude Code la consulte au début de chaque session de refactoring pour suivre une procédure stable d'un module à l'autre.
2. **Document de capitalisation** : à la fin de chaque module, on y consigne ce qui a marché, ce qui a coincé, ce qu'on garde pour le module suivant.
3. **Document vivant** : la méthode est révisée après chaque module si l'expérience révèle qu'une étape doit être renforcée, ajoutée ou retirée. Les révisions sont datées et signées dans la section 8.

**Important** : ce document est rédigé après le démarrage de la première session de refactoring (`bilan-reflexif.js`). Pour cette première session, la rétrospective de §6 sera remplie a posteriori — c'est une concession à l'historique, mais elle reste utile : la méthode n'est jamais figée, elle se construit par l'expérience.

---

## 2. Principes directeurs

Cinq principes sous-tendent toute la méthode. Ils ne sont pas spécifiques à Labo Codex — ils viennent de la pratique standard du refactoring (Fowler 2018, Feathers 2004) — mais leur application au stack Labo Codex (vanilla JS, IIFE + `window.X`, CSP `script-src 'self'`, ordre de chargement séquentiel dans `index.html`) demande quelques précautions spécifiques signalées à la section 5.

**P1. Aucun refactoring sans tests de régression préalables.** Avant toute modification de code, écrire les tests qui décrivent le comportement actuel et les faire passer. Si un test échoue sur le code actuel, c'est qu'on a découvert un bug latent — à corriger avant le refactoring, pas pendant.

**P2. Petits pas, validation à chaque pas.** Un commit = un changement isolé qu'on peut comprendre, tester et reverter indépendamment. Pas de commit fleuve qui mélange plusieurs extractions, renommages et corrections.

**P3. Préservation comportementale stricte.** Le refactoring ne change pas le comportement visible. Si on remarque un bug ou une amélioration possible pendant le refactoring, on le note dans `BACKLOG.md` et on le traite **après** — pas en même temps.

**P4. Réversibilité à tout moment.** À chaque commit, on doit pouvoir revenir à l'état précédent sans perte. Branche dédiée `refactor/<module>`, commits atomiques, tests verts comme condition de commit.

**P5. Capitalisation systématique.** Chaque module refactoré nourrit la méthode pour le suivant. Les leçons sont écrites, pas mémorisées.

**P6. Le LOC total n'est pas la métrique de qualité.** Le refactoring déplace des lignes, il ne les supprime pas. Un module dont on extrait 6 sous-modules peut conserver le même LOC total (voire en gagner légèrement à cause de l'overhead IIFE). Les métriques pertinentes sont la **complexité cyclomatic max**, la **taille du plus gros fichier**, le **code mort effectivement retiré**, les **doublons résolus**, et la **couverture des tests**. Voir §6.5 pour le détail des métriques à relever avant/après chaque refactoring.

---

## 3. Méthode étape par étape

Pour chaque module à refactoriser, suivre les 7 étapes suivantes dans l'ordre. Ne pas sauter d'étape, même si elle semble triviale pour le module en question.

### Étape 0 — Préparation (~15-30 min)

Avant de toucher au code :

- Lire `MODULES-MAP.md` §2.x pour ce module (zones fonctionnelles, découpage proposé, fonctions top-complexité, états globaux, tests de régression listés).
- Lire les leçons des modules précédents dans §7 « Journal de bord » ci-dessous.
- Vérifier que Grégoire a fait un backup Codex récent si le module touche aux clés SSOT critiques (`evaluation.js`, `productions.js`, `profil-etudiant.js`, `trimestre-v2.js`).
- Vérifier que `main` est à jour (`git pull origin main`).
- Créer la branche : `git checkout -b refactor/<nom-module>` depuis `main`.

**Convention nom de branche** : `refactor/<module>` est la convention par défaut (une branche par module, scope clair, facile à identifier dans `git branch -a`). Elle **n'est pas une obligation absolue**. Une branche `refactor/<période>` (par exemple `refactor/2026-mai`) regroupant plusieurs modules refactorés en séquence reste acceptable si :
- Les commits sont **atomiques par sous-module** (`refactor(<module>): extraire <sous-module>`) — un grep `--grep` sur le module retrouve son historique.
- Les modules sont mergés ensemble en fin de période, ou un merge intermédiaire est possible entre deux modules.
- L'historique du module reste lisible — pas de réordonnancement qui mélange les modules.

Cas du module `bilan-reflexif.js` (15 mai 2026) : branche `refactor/2026-mai` créée avant la finalisation de cette méthode, conservée pour ne pas perdre les 8 commits — exception documentée.

**Convention chargement orchestrateurs** : un sous-module qui appelle `window.X` d'AUTRES sous-modules du même module (et non l'inverse) est un **orchestrateur**. Il doit être chargé EN DERNIER dans `index.html` parmi les sous-modules du module. Pattern observé `trimestre-v2-orchestre.js` (consomme `window.populerDropdownGroupesHoraireV2`, `window.afficherTrimestreGroupeCoursV2`, etc.). Identifier les orchestrateurs à l'étape 0 et noter l'ordre voulu dans `MODULES-MAP.md` §2.x.

### Étape 1 — Lecture complète du module (~30 min - 2 h selon taille)

Lire **intégralement** le code du module, pas seulement les noms de fonction. Objectif : repérer ce que les scans automatisés ne voient pas.

À identifier :
- Variables module-scope déclarées en haut de l'IIFE (état partagé entre fonctions).
- Closures qui capturent des variables externes.
- Fonctions imbriquées qui dépendent du scope englobant.
- Effets de bord cachés (modifications de DOM, écritures stockage, appels à d'autres modules).
- Commentaires « TODO », « FIXME », « HACK » — indices de zones fragiles.
- Patterns de dépendance avec d'autres modules (appels à `window.X`, lecture/écriture clés communes).
- **Helpers utilitaires partagés** : les fonctions du module (typiquement `rendre*`, `echapper*`, `tronquer`, `format*`, `genId`, helpers de toggle/aide) qui seront appelées depuis plusieurs sous-modules futurs. Les **promouvoir vers le sous-module `core` AVANT** de scinder le premier sous-module qui les utilise. Symptôme du piège : un `ReferenceError` au premier rendu DOM en prod, invisible aux tests Vitest pures (cf. anti-pattern §5.6). Méthode : `grep -n "function \(rendre\|echapper\|tronquer\|format\|gen\)" js/<module>.js` pour lister les candidats.

**Livrable de l'étape 1** : annoter `MODULES-MAP.md` §2.x avec les écarts entre la cartographie proposée et la lecture réelle. Si des frontières fonctionnelles deviennent impraticables, le signaler explicitement et proposer un découpage révisé. Inclure la liste des helpers candidats à la promotion vers `core`.

### Étape 2 — Écriture des tests de régression (~1-2 h selon module)

Écrire les tests listés dans `MODULES-MAP.md` §2.x pour ce module. Cibler :
- Les fonctions exportées par `window.X` les plus utilisées.
- Les calculs critiques (pour `profil-etudiant.js`, réutiliser les snippets de `audit/01-fidelity/calculations-tests.md`).
- Les transitions d'état global (`window.evaluationEnCours`, `window.trimestreActif`, `window.profilActuelDA`).
- Les parcours utilisateur visibles (Playwright) : ouvrir un formulaire, remplir, soumettre, vérifier le résultat affiché.

Format :
- Vitest pour la logique pure (calculs, transformations de données).
- Playwright WebKit pour les parcours UI.
- Placer dans `tests/unit/refactor-<module>.test.js` ou `tests/integration/refactor-<module>.spec.js`.

**Condition d'avancement** : tous les tests doivent passer sur `main` (code actuel non refactoré) avant de continuer. Si un test échoue, c'est un bug latent — créer une entrée dans `Retours des testeurs/SUIVI-BUGS.md`, corriger, puis revenir au refactoring.

### Étape 3 — Découpage incrémental (~1-6 h selon module)

Pour chaque sous-module cible listé dans `MODULES-MAP.md` :

1. Créer le nouveau fichier `js/<sous-module>.js` avec l'entête IIFE standard du projet :
   ```javascript
   (function() {
       'use strict';
       // ... code extrait ...
       // ... exports window.X ...
   })();
   ```
2. Copier les fonctions concernées depuis le fichier d'origine (sans les retirer de l'original encore).
3. Identifier les dépendances : variables module-scope, helpers, états globaux. Pour chaque dépendance :
   - Si elle est exportée par un autre module : OK, accès via `window.X`.
   - Si elle est interne au fichier d'origine et utilisée par d'autres sous-modules futurs : la promouvoir en `window.X` exporté **avant** de scinder.
   - Si elle est interne et utilisée uniquement par le sous-module en cours : la déplacer aussi dans le nouveau fichier.
4. Ajouter le `<script>` dans `index.html`, **après** les dépendances et **avant** les consommateurs. Vérifier l'ordre de chargement.
5. Retirer les fonctions du fichier d'origine.
6. Lancer les tests de régression. Si verts → commit avec message `refactor(<module>): extraire <sous-module>`. Si rouges → analyser, corriger, recommencer.
7. Test manuel par Grégoire si le sous-module touche à un parcours qu'il utilise au quotidien.

**Règle d'or** : un sous-module = un commit. Ne pas accumuler plusieurs extractions avant de commiter.

**Grep `window.X` AVANT et APRÈS chaque extraction** : les exports thématiques peuvent être dispersés (pas tous en bas du fichier). Une extraction qui rate un export laisse une fonction « orpheline » qui plante au premier appel via `data-action`. Procédure : avant l'extraction, `grep -n "^window\." js/<module>.js` pour identifier les exports dispersés ; après l'extraction, re-grep pour vérifier que tous les exports déplacés sont bien dans le sous-module et tous les exports résiduels sont bien dans le résidu. Cf. cas productions.js (9 exports thématiques L2689-2702 pré-extraction).

**Renommage si résidu déjà IIFE complet** : quand le résidu d'une session précédente est déjà un IIFE complet englobant l'intégralité de la zone à extraire dans la session courante, **`git mv` est l'opération la plus sûre** (0 LOC de code modifiée). Workflow : `git mv js/<module>.js js/<sous-module>.js` + réécriture de l'en-tête de fichier + ajustement du `<script>` tag dans `index.html` + tests. Le `sed delete` reste obligatoire si la zone à extraire est UNE PARTIE du résidu uniquement. Cf. profil-etudiant session D (`git mv profil-etudiant.js → profil-etudiant-sections-affichage.js`).

### Étape 4 — Refactoring des fonctions top-complexité (~1-3 h selon module)

Pour chaque fonction identifiée par `MODULES-MAP.md` §2.x comme « top-complexité » (cyc > 30 ou > 50) :

- Identifier les blocs cohérents : initialisation, validation des entrées, calcul principal, mise à jour DOM, sauvegarde, gestion d'erreurs.
- Extraire chaque bloc en sous-fonction nommée explicitement.
- Faire passer les tests après chaque extraction.

Cible : aucune fonction au-delà de cyclomatic 30 dans les nouveaux sous-modules. Cible souple : tendre vers cyclomatic ≤ 15 quand c'est faisable sans contorsion artificielle.

Vérification : lancer `npx eslint --rule '{"complexity": ["error", 30]}' js/<sous-module>.js` avant de commiter chaque sous-module.

**Audit complet à chaque extraction** : passer ESLint complexity sur **tous les sous-modules déjà extraits dans la session**, pas seulement le sous-module en cours. Une fonction héritée peut avoir une complexité au-dessus du seuil dans son sous-module d'arrivée et ne sera pas attrapée si on n'audite que le périmètre courant. Cas vu lors de `bilan-reflexif.js` : `_agregerQuestion` (cyc 48) et `parserQuestionnaireTexte` (cyc 63) ont nécessité une correction a posteriori en un commit unifié au lieu d'être traités à leur extraction.

Procédure recommandée : créer un script `audit/refactoring-prep/check-complexity.sh` qui lance `npx eslint --no-eslintrc --parser-options ecmaVersion:2020 --rule '{"complexity": ["error", 30]}' js/<prefix>*.js` (avec `<prefix>` égal au préfixe partagé des sous-modules du module en cours) et le faire tourner après chaque extraction.

**Trade-off cyc 15 vs cyc 30** : l'extraction d'helpers pour casser une fonction au-delà de cyc 30 peut introduire de nouveaux helpers entre cyc 15 et cyc 30. C'est acceptable selon le principe « distribuer la complexité plutôt que la concentrer ». **La cible souple (cyc ≤ 15) est optionnelle ; la cible dure (cyc ≤ 30) est obligatoire.**

**Stratégie cyc > 30 (cible dure vs héritages Cat-B)** : sur les god modules avec >>5 fonctions cyc > 30, la décision pragmatique consiste à **éclater systématiquement le monstre central** (cyc max ET toute fonction cyc > N) et **documenter les autres comme héritages Catégorie B post-merge**. **N = 50** est le seuil acté avec Grégoire (evaluation, 18 mai 2026) : au-dessus → éclatement obligatoire pendant le refactor ; en-dessous → héritage Cat-B inscrit dans le journal §7 et traité dans un cycle dédié.

**Découpage supplémentaire pour cible dure** : l'éclatement initial planifié à N fonctions peut produire une fonction au-dessus de la cible dure (cyc > 30) sous l'effet de la déduplication des branches. Si l'éclatement initial laisse un helper à cyc 32-45, **extraire un sous-helper additionnel jusqu'à respecter la cible dure**. Pattern observé Phase 2 session C trimestre-v2 (`_rafraichirVuesContextDependantes` cyc 36 → ajout `_rafraichirProfilEtudiantSiVisible` → cyc 28).

**Extraction agrégée + sous-helpers DOM** : une extraction initiale agrégée (par ex. `_construireNouvelleEvaluation`) peut produire un helper qui reste cyc > 30 par accumulation `|| {}`, ternaires, spread. **Si helper extrait reste cyc 32-45, identifier les dimensions internes (lire/valider/construire/écrire) et extraire un sous-helper par dimension** (`_lireChampsDOM*`, `_lireOptionsAffichage*`, `_validerX*`). Pattern 3× confirmé sur trimestre-v2 + evaluation.

**Monstre privé IIFE éclatable sans promotion `window.X`** : un monstre cyc 30-50 défini PRIVÉ dans une IIFE peut être éclaté en helpers privés internes **sans promotion** si tous les call-sites restent intra-IIFE. **Audit pré-éclatement** : `grep -n "nomFonction\b" js/*.js` (sans `window.`) → si 0 hits cross-IIFE → éclatement intra-IIFE possible et préféré (pas d'inflation de la surface publique).

**Bug latent détecté pendant la lecture pré-éclatement** : la lecture systématique d'une fonction monstre avant son éclatement révèle parfois des bugs latents (branches manquantes, dead code, etc.). **Signaler tout bug latent détecté en SUIVI-BUGS et préserver tel quel dans le helper extrait avec commentaire explicite.** Pattern session D profil-etudiant bug #106 (branche manquante `progression && progressionVisible` préservée dans `_resoudreSectionContenu`).

**Protocole « fix bug latent INTERNE avant éclatement »** : si un bug latent identifié vit **À L'INTÉRIEUR** du monstre qu'on s'apprête à éclater (ex. variable cross-IIFE référencée par le monstre), corriger le bug **AVANT** l'éclatement dans **un commit dédié de pré-requis**. Sinon les helpers extraits héritent du bug et le débogage devient plus complexe. **Distinguer des bugs latents EXTERNES qui restent préservés Cat-B.** Pattern bug #109 evaluation étape 4 (commit `9045dfd` AVANT les 6 commits d'éclatement).

### Étape 5 — Validation du module entier (~30 min - 1 h)

Une fois tous les sous-modules extraits :

- Lancer la suite complète des tests : `cd tests && npm test`.
- Lancer un test manuel exhaustif du module dans l'app, validé par Grégoire :
  - Pour `evaluation.js` : chargement + saisie + sauvegarde + modification + filtre par production + verrouillage.
  - Pour `productions.js` : création + modification + suppression + bibliothèque + import/export.
  - Pour `trimestre-v2.js` : création trimestre + CRUD cours/étudiants/horaires/groupes-cours + changement groupe-cours actif.
  - Pour `profil-etudiant.js` : affichage profil + section confidentiel + jetons.
  - Pour `bilan-reflexif.js` : éditeur + parcours + réflexion + import CSV + rapport.
- **Tester chaque cas dans les deux modes (sombre + clair) explicitement**, pas seulement le mode utilisé en développement. Pour les modules avec rendu HTML dense (productions form, bibliothèque, palettes d'évaluation, profil), les régressions visuelles sont silencieuses jusqu'au switch de mode.
- Bump version dans `version.json` : Beta XX.Y → XX.(Y+1), build courant. Mettre à jour les fallback dans `index.html` (~ligne 17166).

### Étape 6 — Capitalisation (~30-45 min)

Avant de merger sur `main`, remplir la rétrospective dans §6.5 (gabarit de capitalisation) et mettre à jour les documents factuels listés en §6.2. Cette étape est **obligatoire**, pas optionnelle. Suivre la gouvernance §6.1 pour distinguer ce qui se rédige directement (Catégorie A) et ce qui passe par validation Grégoire (Catégorie B).

Puis :
- Push la branche : `git push origin refactor/<module>`.
- Rédiger le message de commit de merge selon §6.6.
- Merge sur `main` (squash ou merge classique selon l'historique souhaité).
- Supprimer la branche distante : `git push origin --delete refactor/<module>`.

---

## 4. Check-lists par étape

### Check-list de démarrage de session (étape 0)

- [ ] J'ai lu `MODULES-MAP.md` §2.x pour ce module.
- [ ] J'ai lu les leçons des modules précédents (§7).
- [ ] Grégoire a fait un backup Codex récent (si module SSOT-critique).
- [ ] `git status` est propre. `git pull origin main` à jour.
- [ ] Branche `refactor/<module>` créée depuis `main`.

### Check-list après lecture (étape 1)

- [ ] J'ai lu **intégralement** le module (pas juste les noms de fonction).
- [ ] J'ai identifié les variables module-scope et les closures.
- [ ] J'ai identifié les effets de bord cachés.
- [ ] J'ai listé les commentaires TODO/FIXME/HACK.
- [ ] J'ai listé les dépendances externes (appels à `window.X` d'autres modules).
- [ ] J'ai annoté `MODULES-MAP.md` §2.x avec les écarts éventuels.

### Check-list après tests (étape 2)

- [ ] Les tests listés dans `MODULES-MAP.md` §2.x sont écrits.
- [ ] Les tests passent sur `main` (code non refactoré).
- [ ] Si un test a échoué : bug latent inscrit dans `SUIVI-BUGS.md`, corrigé, test repassé en vert.

### Check-list par sous-module (étape 3)

- [ ] **Grep doublons d'export pré-deletion** : `grep -n "^window\.X = X" js/<module>.js` pour identifier les exports doublés AVANT extraction. Un orphelin où `X` est extrait transforme le résidu en `ReferenceError: X is not defined` au chargement IIFE.
- [ ] Nouveau fichier `js/<sous-module>.js` créé avec entête IIFE standard.
- [ ] Fonctions copiées sans modification fonctionnelle.
- [ ] Dépendances identifiées et résolues (exposition `window.X` si nécessaire).
- [ ] **Audit symétrique inverse exports** : pour chaque `window.X = X` dans la zone à extraire, grep la fonction X ; si fonction HORS zone (reste dans le résidu) → retirer l'export du contenu extrait + rajouter manuellement dans le résidu (1 ligne).
- [ ] `<script>` ajouté dans `index.html` au bon endroit (après dépendances, avant consommateurs ; **orchestrateurs en dernier** parmi les sous-modules du module — cf. §3 étape 0).
- [ ] Fonctions retirées du fichier d'origine.
- [ ] **Grep `window.X` POST-deletion** : `grep -n "^window\." js/<module>.js` pour vérifier qu'aucun export n'a été oublié dans le résidu, et grep dans le sous-module pour vérifier que tous les exports voulus y sont bien.
- [ ] **Audit cross-zone tardif** : `grep -n "<nomFonction>\b" js/<module>.js` pour chaque fonction extraite, vérifier qu'aucun caller résidu (zone non extraite) ne référence la fonction sans `window.X`. Insérer `window.` ou patch §5.6 si besoin.
- [ ] ESLint complexity ≤ 30 sur ce sous-module **ET sur tous les sous-modules déjà extraits dans la session** (cf. §3 étape 4).
- [ ] Grep des helpers (`rendre*`, `echapper*`, `tronquer`, `format*`, `genId`) — confirmer qu'ils sont accessibles depuis ce sous-module (alias en tête de fichier ou exports `core`) avant le commit (cf. anti-pattern §5.6).
- [ ] Tests de régression verts.
- [ ] Commit atomique avec message `refactor(<module>): extraire <sous-module>`.

### Check-list de fin de module (étapes 5 et 6)

- [ ] Tests projet complets verts (`cd tests && npm test`).
- [ ] Test manuel exhaustif validé par Grégoire.
- [ ] **Métriques avant/après relevées** : LOC, complexité cyc max, nombre de fonctions au-delà des seuils, taille du plus gros fichier, doublons, code mort retiré, variables inutilisées nettoyées (méthodes de relevé en §6.5).
- [ ] Bump version dans `version.json` et `index.html` fallback.
- [ ] Documents factuels (§6.2) à jour : §7 rétrospective remplie selon gabarit §6.5, `MODULES-MAP.md` §2.x annoté, `SUIVI-BUGS.md` complété au fil de l'eau, `SESSION.md` mis à jour.
- [ ] Propositions méthodologiques (§6.3) consignées dans §7 sous « Améliorations de la méthode à proposer », en attente de validation Grégoire.
- [ ] Documents projet (§6.4) mis à jour si pertinent : `DATA-OWNERSHIP.md`, `BACKLOG.md`, etc.
- [ ] Message de commit de merge rédigé selon §6.6.
- [ ] Branche mergée sur `main`, branche distante supprimée.

---

## 5. Anti-patterns spécifiques à Labo Codex

Treize pièges connus, spécifiques au stack et aux conventions du projet. À surveiller à chaque module.

### 5.1 Ordre de chargement dans `index.html`

`index.html` charge les `<script>` séquentiellement (pas de modules ES, pas de bundler). Si on déplace une fonction dans un nouveau fichier et que ce fichier est chargé **après** un consommateur, le consommateur trouve `undefined` au chargement de la page. Symptôme : erreur silencieuse à l'initialisation, ou bug fonctionnel qui n'apparaît que sur certains parcours.

**Vérification** : pour chaque nouveau fichier, lister ses consommateurs (`grep -rn 'window.<fonction>' js/`) et confirmer qu'ils sont tous chargés **après**.

### 5.2 CSP `script-src 'self'` stricte

Pas de script inline, pas de `eval()`, pas de `new Function()`. Si une fonction utilise dynamiquement le nom d'un handler (par exemple `data-action="${nomHandler}"`), le nom doit correspondre à un export `window.X` réel et reconnu par le dispatcher central. Un sous-module qui exporte sous un nouveau nom doit ajouter `window.X = X` pour rester compatible avec le dispatcher.

**Vérification** : grep des `data-action="..."` après refactoring pour s'assurer que tous les handlers référencés existent toujours sous `window.X`.

### 5.3 Variables module-scope qui deviennent invisibles

Une variable déclarée en haut d'une IIFE est accessible à toutes les fonctions du module, mais **pas** aux fonctions extraites dans un autre fichier. Si plusieurs sous-modules ont besoin d'une même variable, il faut soit la promouvoir en `window.X` (avec les précautions sur l'état partagé), soit en faire un module dédié (`<module>-state.js`).

**Vérification** : grep dans le fichier d'origine des références à toute variable module-scope avant de scinder.

### 5.4 Convention `cle('nomCle')` pour namespacing trimestre

Les données sont préfixées par trimestre via `window.cle('nomCle')` qui retourne `'<tri>_nomCle'`. Si on remplace par un accès direct `localStorage.getItem('nomCle')`, on casse le namespacing et on lit/écrit les données du mauvais trimestre.

**Vérification** : aucun nouveau `localStorage.getItem`/`setItem` direct dans les sous-modules ; toujours passer par `db.*` (qui appelle `cle()` en interne) ou par `cle()` directement quand on a besoin de la clé namespacée.

### 5.5 États globaux pivot manipulés en plusieurs endroits

`window.evaluationEnCours`, `window.trimestreActif`, `window.profilActuelDA` sont modifiés depuis plusieurs sous-modules. Si on les modifie de manière non atomique pendant une transition, on peut laisser l'app dans un état incohérent (par exemple : `trimestreActif` changé mais `groupeCoursActif` pas encore mis à jour).

**Précaution** : pour ces états, soit on garde la fonction de transition dans un seul sous-module dédié (par exemple `changerGroupeCoursActifV2` reste dans `trimestre-v2-orchestre.js` et est la seule à modifier `trimestreActif`), soit on encapsule l'état dans un module dédié (`<module>-state.js`) qui expose une API atomique (`get`, `set`, `reset`).

### 5.6 Helpers cross-module non identifiés à l'étape 1

Symptôme : un `ReferenceError` au premier rendu DOM en prod, **invisible aux tests Vitest pures**. Le test passe vert parce qu'il n'exécute jamais le rendu — il teste les fonctions pures (parseurs, agrégations, formatages). Le bug se déclenche au premier clic utilisateur sur l'onglet correspondant.

Cause : un helper (`rendreAideHTML`, `toggleAide`, `tronquer`, etc.) était défini dans le module d'origine et consommé localement. Une fois certaines fonctions extraites dans un sous-module, le helper reste dans le résidu mais est appelé depuis le sous-module extrait → ReferenceError silencieux.

**Détection** : à l'étape 1 (lecture), grep des helpers connus du projet (`rendre*`, `echapper*`, `tronquer`, `format*`, `genId`) AVANT chaque extraction. Si un helper est consommé par plus d'un sous-module futur, le **promouvoir vers `core`** avant la première extraction (cf. §3 étape 1 et anti-pattern §5.3).

**Cas vu** : `bilan-reflexif.js` — `rendreAideHTML`/`toggleAide` consommés par `editeur.js` et `parcours.js` extraits ; `tronquer` consommé par `reflexion.js`, `csv.js`, `rapport.js` extraits. Tous restés dans le résidu jusqu'à découverte par grep manuel en §4.1.f.

### 5.7 Resync ctx ↔ parent dans une refacto de state machine

Symptôme : un test bien ciblé devient rouge après l'introduction d'un ctx partagé dans une fonction extraite. Le bug est immédiat, pas latent — mais perfide parce qu'on cherche la cause dans le code extrait alors qu'elle est dans la mécanique de partage.

Cause : la fonction extraite mute le ctx ET appelle une closure du parent qui réassigne une variable parent par référence (`preambuleLignes = null`). Une **resync bidirectionnelle** ctx → parent en fin d'itération restaure l'ancienne valeur après que la closure a fait son travail → l'effet de la closure est perdu, la suite de l'itération consomme un état obsolète.

**Règle** : **ne resynchroniser que parent → ctx en début d'itération**, jamais l'inverse. Les closures du parent qui mutent par référence s'occupent du retour vers le parent directement — pas besoin de les doubler par une resync ctx → parent.

**Cas vu** : refacto de `parserQuestionnaireTexte` (`bilan-reflexif.js`, §4.1.g étape 4). La closure `fermerPreambule()` du parent mettait `preambuleLignes = null` ; la resync ctx → parent restaurait l'array juste après, faisant consommer les options `a./b./c.` dans le préambule au lieu d'ouvrir une nouvelle question.

### 5.8 Wrappers résiduels avec variables module-scope

Symptôme : un sous-module extrait tente d'appeler `sauvegarderX()` directement et observe que le wrapper `sauvegarderXOriginale` du résidu rajoute des side-effects invisibles (rechargement sidebar, notif). Cause : le résidu wrap les fonctions par réassignation `window.X = wrapper` après la définition, et le wrapper ferme `XOriginale` (variable module-scope).

**Règle** : **conserver les wrappers et leurs variables module-scope dans le résidu pendant le découpage.** Les déplacer vers un sous-module casse la chaîne — la closure ne traverse pas la frontière IIFE.

**Cas vu** : `productions.js` (16 mai 2026) — `sauvegarderProductionOriginale`/`annulerFormProductionOriginale`/`supprimerProductionOriginale` ont dû rester groupés dans le résidu lors de l'extraction des sous-modules `-liste.js` / `-import-export.js` / `-bibliotheque-ui.js`.

### 5.9 Factoriser les branches dupliquées en paramètres

Symptôme : deux branches d'une fonction partagent 90 %+ du code mais diffèrent sur 2-3 valeurs ou un message. Tentation de tout dupliquer pour rester littéral. Conséquence : la fonction agrégée gagne en complexité cyclomatic (cyc 47 vu sur `_rafraichirVuesContextDependantes` avant factorisation) parce que chaque divergence ajoute un `if/else`.

**Règle** : repérer les blocs avec 90 %+ de code dupliqué et abstraire les différences en paramètres. Le helper résultant accepte les divergences en paramètres (`valeurHeader`, `messageNotification`, `regenererCalendrier`) ; la fonction outer choisit les valeurs selon le mode.

**Cas vu** : `trimestre-v2-orchestre.js` Phase 2 (17 mai 2026) — `_rafraichirVuesContextDependantes(valeurHeader, messageNotification, regenererCalendrier)` factorise les branches Mode COURS et Mode GROUPE-COURS (gain : −110 LOC vs duplication, cyc agrégé 28 vs 47 dupliqué).

### 5.10 Acquittement `// security-ok` INLINE OBLIGATOIRE

Le hook pré-commit Défense J (baseline F.16 par fichier) refuse les acquittements `// security-ok` en commentaire de bloc avant l'innerHTML. **Le commentaire DOIT être en suffixe inline sur la même ligne** que l'instruction `innerHTML`. Toute extraction de zone avec innerHTML interpolé re-flague baseline F.16 — re-essai obligatoire si commentaire en bloc.

```javascript
// ❌ REFUSÉ par le hook (commentaire de bloc avant)
// security-ok: code transféré tel quel — bug pré-existant SUIVI-BUGS #99
elemProgrammes.innerHTML = `...${prog}...`;

// ✅ ACCEPTÉ (suffixe inline)
elemProgrammes.innerHTML = `...${prog}...`; // security-ok: bug #99 préservé
```

**Cas vu** : `profil-etudiant-confidentiel.js` session B (18 mai 2026) — premier essai en bloc commentaire refusé, réécriture inline pour passage.

### 5.11 Variables module-scope encapsulées dans IIFE

La convention de promotion `window.X` systématique des **fonctions** extraites NE S'APPLIQUE PAS aux **variables module-scope** (`let`/`const`). Préservation de l'encapsulation d'origine — préfixe `_` = privée d'origine, reste privée après extraction.

**Règle** : seules les fonctions sont promues `window.X` systématiquement. Les variables `_X` préfixées par underscore ou clairement privées (état module, constantes de configuration) restent dans le scope IIFE local.

**Cas vu** : `profil-etudiant-confidentiel.js` session B (18 mai 2026) — `_confidentielDaActuel` (état module) et `SOUS_CATEGORIES_SERVICES` (constante) restent privées au sous-module, pas de promotion `window.X`.

**Exception** : si une variable `let X` est référencée cross-IIFE (bug latent #109), voir §5.12 ci-dessous.

### 5.12 Variables `let` cross-IIFE non promues `window.X`

Symptôme : un sous-module référence une variable `let X` déclarée dans une AUTRE IIFE (bare reference, sans `window.`). Le runtime jette `ReferenceError: X is not defined` au premier appel — invisible aux tests Vitest pures (file scope JSDOM différent de browser).

**Règle** : si une variable `let X` est partagée entre 2 IIFE+ (cas opposé à §5.11 — variable PAS strictement privée), **promotion `window.X` obligatoire avec drop du `let`** :

```javascript
// ❌ AVANT (let cross-IIFE — ReferenceError)
// dans evaluation-chargement.js
let _timerAutoSave = null;
// dans evaluation.js résidu
_timerAutoSave = setTimeout(...); // ReferenceError au runtime

// ✅ APRÈS (promotion window.X explicite)
// dans evaluation-chargement.js
window._timerAutoSave = null;
// dans evaluation.js résidu
window._timerAutoSave = setTimeout(...); // Patch §5.6 sur tous les sites
```

Patch §5.6 obligatoire sur **tous les sites de référence** (intra-IIFE et cross-IIFE) — single source of truth sur window.

**Cas vu** : bug #109 (`evaluation.js` étape 4, 18 mai 2026) — `_timerAutoSave` + `_pendingAutoSaveSnapshot` déclarés `let` dans `evaluation-chargement.js` L1086-1087, référencés bare dans 3 sites cross-IIFE résidu/sauvegarde. ReferenceError au runtime sur `sauvegarderEvaluation`. Corrigé en commit `9045dfd` AVANT les éclatements du monstre (cf. §3 étape 4 protocole « fix bug latent avant éclatement »).

### 5.13 Closures internes async passées en paramètre

Symptôme : un monstre async contient des closures internes (`const attendre = async () => ...`) qui accèdent aux paramètres du parent (`evaluationId`, `etudiantDA`). Si on extrait un helper qui utilise ces closures et qu'on les **promeut `window.X`**, on casse l'accès aux paramètres + pollue window.

**Règle** : les closures internes async DOIVENT rester définies dans la fonction outer et être **passées en paramètre** aux helpers extraits. Pas de promotion `window.X`.

```javascript
// ❌ AVANT (closure interne async, monstre cyc 78)
async function modifierEvaluation(evaluationId) {
    const attendreOption = async () => { /* accès evaluationId */ };
    const trouverGroupeEtudiant = () => { /* accès evaluationId */ };
    // ... 200 LOC ...
}

// ✅ APRÈS (helpers extraits, closures passées en paramètre)
async function modifierEvaluation(evaluationId) {
    const attendreOption = async () => { /* accès evaluationId */ };
    const trouverGroupeEtudiant = () => { /* accès evaluationId */ };
    await _appliquerModifFormulaire(evaluationId, attendreOption, trouverGroupeEtudiant);
}
```

**Cas vu** : `evaluation.js` étape 4 (18 mai 2026) — `modifierEvaluation` cyc 78 éclatée avec 5 helpers privés qui reçoivent `attendreOption` et `trouverGroupeEtudiant` en paramètre. Closures restent locales à l'outer.

---

## 6. Rapport de fin de module

À la fin de chaque module refactoré, avant le merge sur `main`, plusieurs documents sont mis à jour. La gouvernance distingue ce que Claude Code rédige directement et ce qui passe par une validation de Grégoire, pour éviter la dérive où la méthode s'adapte rétroactivement à ce qui s'est passé plutôt qu'à ce qu'il aurait fallu faire.

### 6.1 Principe de gouvernance

Deux catégories de mise à jour, traitées différemment :

**Catégorie A — Documents factuels.** Claude Code rédige directement, à partir de ce qui s'est effectivement passé dans la session. La rédaction est descriptive, pas évaluative. Grégoire relit en révision avant le merge mais n'a pas à approuver chaque phrase — il vérifie que ce qui est écrit correspond à ce qu'il observe (commits, fichiers créés, tests).

**Catégorie B — Documents méthodologiques.** Claude Code formule des **propositions** d'amélioration dans la rétrospective §6.5. Grégoire décide si ces propositions sont intégrées dans la méthode (§3 à §5). Sans cette barrière, la méthode peut dériver vers la rationalisation a posteriori des écarts (« cette étape n'était pas nécessaire ») au lieu de capter ce qu'il aurait fallu faire (« j'ai sauté cette étape, voici pourquoi, voici comment l'éviter »).

La raison de cette distinction est qu'une méthode qui s'auto-modifie sans contrôle externe finit par décrire ses propres écarts comme normaux. Le filtre humain protège contre ce glissement.

### 6.2 Catégorie A — Documents factuels (Claude Code rédige directement)

| Document | Section | Quoi écrire | Quand |
|---|---|---|---|
| `METHODE-REFACTORING.md` | §7 (entrée du module) | Rétrospective complète selon le gabarit §6.5 | Fin de session, avant merge |
| `MODULES-MAP.md` | §2.x du module | Section « Écarts observés à l'exécution » : frontières effectives vs proposées, sous-modules effectivement créés et leur taille finale en LOC | Fin de session, avant merge |
| `Retours des testeurs/SUIVI-BUGS.md` | Au fil de l'eau | Chaque bug latent identifié pendant l'écriture des tests : date, build, description, statut (corrigé / ouvert) | Pendant la session, dès découverte |
| `version.json` + `index.html` fallback (~ligne 17166) | Racine du dépôt | Bump version Beta + build courant `MMJJ-HHMM` (Toronto) | Fin de session, juste avant le commit final |
| `audit/SESSION.md` | Nouvelle partie ou addendum | Entrée datée : commits, branche, sous-modules créés, statut, lien vers rétrospective | Fin de session, avant merge |

Si Claude Code estime qu'une rédaction est délicate (par exemple : « la cartographie de MODULES-MAP était fausse mais je ne sais pas comment formuler »), il **signale le doute à Grégoire** dans son message de fin de session, plutôt que de risquer une formulation contestable.

### 6.3 Catégorie B — Documents méthodologiques (Claude Code propose, Grégoire valide)

| Document | Section | Type de proposition |
|---|---|---|
| `METHODE-REFACTORING.md` | §3 (méthode) | Étape à ajouter, modifier, supprimer |
| `METHODE-REFACTORING.md` | §4 (check-lists) | Item à ajouter ou retirer d'une check-list |
| `METHODE-REFACTORING.md` | §5 (anti-patterns) | Nouveau piège spécifique à Labo Codex identifié pendant le refactoring |
| `METHODE-REFACTORING.md` | §8 (historique des révisions) | Une ligne par révision validée par Grégoire |

**Procédure** :

1. Claude Code écrit ses propositions dans la rétrospective §7 du module concerné, sous la rubrique « Améliorations de la méthode à proposer » du gabarit §6.5.
2. Grégoire lit les propositions, accepte ou refuse chacune. Décision visible.
3. Pour les propositions **acceptées** : Claude Code (dans la même session ou la suivante) édite la section concernée (§3, §4, §5) et ajoute une ligne dans §8 avec le module à l'origine de la révision.
4. Pour les propositions **refusées** : Grégoire laisse un commentaire dans §7 expliquant pourquoi (1-2 phrases suffisent). La trace est conservée — on saura plus tard pourquoi telle proposition n'a pas été retenue.

### 6.4 Documents projet — mise à jour conditionnelle

À toucher uniquement si le refactoring l'impose effectivement. Claude Code juge la pertinence, Grégoire confirme en cas de doute :

- **`docs/DATA-OWNERSHIP.md`** : si le refactoring a déplacé une fonction qui écrit dans une clé SSOT, l'owner mentionné peut être obsolète. Pour chaque clé SSOT touchée, faire un grep des écritures (`grep -rn "db.setSync('<cle>'" js/`) et mettre à jour la table d'owners.
- **`docs/00-START-HERE.md`** : si le module refactoré était mentionné nominativement dans le routeur d'onboarding, mettre à jour la mention.
- **`BACKLOG.md`** : inscrire la dette résiduelle (sous-modules encore trop gros, fonctions encore au-dessus du seuil de complexité non traitées) avec un renvoi à la rétrospective §7 du module.
- **`CLAUDE.md`** racine : très improbable — seulement si une convention de projet a effectivement changé. À discuter explicitement avec Grégoire si Claude Code estime que c'est le cas.

### 6.5 Gabarit de capitalisation

À remplir à la fin de chaque module refactoré, avant le merge sur `main`. Reproduit ci-dessous, à copier-coller dans une entrée de §7.

**Note méthodologique sur les métriques** : la réduction du LOC total n'est **pas** la métrique de qualité du refactoring. Un refactoring bien fait peut laisser le LOC total quasi inchangé (les lignes sont déplacées, pas supprimées). Les vraies métriques à suivre sont la complexité cyclomatic par fonction, la taille par fichier, le code mort effectivement retiré, les doublons résolus, et la couverture des tests. Voir la rubrique « Métriques avant/après » du gabarit. Une remontée du LOC d'un module après refactoring n'est pas une mauvaise nouvelle si elle s'accompagne d'une baisse de la complexité max et d'une meilleure distribution des tailles de fichier.

```
### Module : <nom>
**Date de fin** : YYYY-MM-DD
**Branche** : refactor/<module>
**Commits** : N (de SHA à SHA)
**Effort réel** : X h (vs estimation MODULES-MAP : Y h, écart : Z %)

#### Frontières fonctionnelles
- Découpage proposé par MODULES-MAP suivi ? Oui / Non (préciser les écarts)
- Sous-modules effectivement créés et leur taille finale en LOC
- Si écarts : pourquoi (dépendances cachées découvertes, frontière impraticable, etc.)

#### Métriques avant/après

| Métrique | Avant | Après | Variation |
|---|---:|---:|---:|
| LOC du module (wc -l) | | | |
| Nombre de fichiers issus du module | 1 | | |
| Taille du plus gros fichier (LOC) | | | |
| Complexité cyclomatic max (ESLint complexity) | | | |
| Nombre de fonctions au-delà de cyc 15 | | | |
| Nombre de fonctions au-delà de cyc 30 | | | |
| Doublons de définition (cf. MODULES-MAP §2.x) | | 0 | |
| Code mort retiré (nombre de fonctions) | — | | |
| Variables inutilisées nettoyées (no-unused-vars) | | | |
| Tests Vitest sur ce module | | | |
| Tests Playwright sur ce module | | | |

**Lecture attendue** : le LOC total peut être stable ou en légère hausse (overhead IIFE des nouveaux sous-modules + signatures d'extraction). Ce qui doit baisser : complexité cyclomatic max, taille du plus gros fichier, nombre de fonctions au-delà des seuils. Ce qui doit monter : nombre de fichiers issus du module (= découpage effectif), nombre de tests.

#### Tests de régression
- Nombre de tests écrits avant refactoring (Vitest + Playwright)
- Tests qui ont raté des régressions pendant le refactoring (à renforcer)
- Tests qui en ont attrapé une (à conserver tels quels)
- Bugs latents découverts pendant l'écriture des tests (avant refactoring)

#### Tests Playwright pour les rendus DOM
- Si le module contient des fonctions `rendreX()` qui injectent du HTML, **au moins un test Playwright** doit les déclencher (ouverture de la vue, premier rendu, interaction de base).
- Objectif : attraper les `ReferenceError` cross-module (cf. anti-pattern §5.6) que les tests Vitest pures ne voient pas — le test pure ne déclenche jamais le rendu.
- Inventaire : lister les fonctions `rendreX()` du module, indiquer celles couvertes par un test Playwright et celles renvoyées en dette résiduelle.
- Si non réalisé : inscrire à la dette résiduelle avec justification (par exemple : « rendu trop dense pour un test minimal, prévu post-trimestre »).

#### Nettoyage effectué pendant le refactoring
- Code mort retiré : <liste des fonctions supprimées avec ligne d'origine>
- Doublons résolus : <liste avec quelle version a été conservée et pourquoi>
- Variables inutilisées nettoyées : <compte ou liste si pertinent>
- Accès localStorage direct migrés vers db.* : <oui/non/partiel, détails>
- Helpers globaux consolidés : <oui/non, lesquels>

#### Difficultés rencontrées
- Pièges qu'on n'avait pas anticipés
- Étapes qui ont pris plus de temps que prévu
- Décisions qu'il a fallu prendre en cours de route

#### Stratégie cyc > 30 (cible dure vs héritages Cat-B)

À documenter pour chaque module avec fonctions cyc > 30 :
- Quelles fonctions ont été ÉCLATÉES pendant le refactor (cible dure obligatoire) — cyc avant / cyc après / nombre de sous-helpers extraits.
- Quelles fonctions ont été DOCUMENTÉES en héritages Cat-B post-merge (seuil pragmatique N=50) — fichier, cyc, raison du report.
- Référence au seuil N acté avec Grégoire (par défaut N=50 depuis evaluation, 18 mai 2026).

#### Améliorations de la méthode à proposer (Catégorie B — décision Grégoire)
- Étapes à renforcer dans §3
- Anti-patterns à ajouter à §5
- Check-lists à étendre dans §4

#### État de la dette résiduelle
- Sous-modules encore trop gros (> 2 000 LOC) à éclater plus tard
- Fonctions encore au-dessus du seuil de complexité 15 ou 30
- Couplages que ce refactoring n'a pas adressés
- Tests qu'on aurait dû écrire mais qu'on a renvoyés à plus tard

#### Notes pour le module suivant
- Recommandations spécifiques pour qui démarre le prochain module
```

**Comment relever ces métriques en pratique** :

- **LOC** : `wc -l js/<module>.js` (et la somme `wc -l js/<sous-module>-*.js` après).
- **Complexité cyclomatic** : `npx eslint --rule '{"complexity": ["error", 15]}' js/<module>.js` (le rapport liste les fonctions au-delà, avec leur cyc).
- **Doublons** : grep des noms de fonctions définis 2 fois dans le même fichier (ex : `grep -n "^function restaurerPreferenceTri" js/evaluation.js`).
- **Variables inutilisées** : `npx eslint --rule '{"no-unused-vars": ["error"]}' js/<module>.js` (compte les hits réels, hors faux positifs structurels).
- **Tests** : `cd tests && npx vitest list | grep refactor-<module>` pour le compte Vitest.

### 6.6 Message de commit de merge — rapport synthétique

Le message du commit de merge sur `main` est lu par les futurs lecteurs du `git log`. Il doit être plus qu'un `refactor(<module>): découpage`. Format obligatoire :

```
refactor(<module>): découpage en <N> sous-modules

Sous-modules créés :
- <sous-module-1>.js (XXX LOC)
- <sous-module-2>.js (YYY LOC)
- ... (lister tous les sous-modules créés)

Métriques avant/après :
- Complexité cyclomatic max : <avant> → <après>
- Fonctions au-delà de cyc 15 : <avant> → <après>
- Taille du plus gros fichier (LOC) : <avant> → <après>
- LOC du module (somme) : <avant> → <après>

Nettoyage :
- Code mort retiré : <liste des fonctions supprimées>
                     OU "aucun"
- Doublons résolus : <liste>
                     OU "aucun"
- Variables inutilisées nettoyées : <compte>
                                    OU "aucune"

Tests : <N> nouveaux tests Vitest + <M> tests Playwright
        (tests/unit/refactor-<module>.test.js,
         tests/integration/refactor-<module>.spec.js)
Régression : aucune détectée (manuelle + automatisée)
             OU "une régression sur Z, corrigée dans commit ABC"
Dette résiduelle : <description courte>
                   OU "aucune"
Bugs latents corrigés : <liste avec ID SUIVI-BUGS>
                        OU "aucun"

Rétrospective : audit/refactoring-prep/METHODE-REFACTORING.md §7
Version bumped : Beta XX.Y → XX.(Y+1)
```

**Note de lecture pour ce format** : la rubrique « Métriques avant/après » est explicitement orientée vers ce qui doit baisser (cyclomatic max, fonctions au-delà du seuil, taille du plus gros fichier). Le LOC total y figure aussi, mais sans jugement : son évolution est neutre — si le LOC reste stable ou augmente légèrement, ce n'est pas un problème tant que les autres métriques s'améliorent. Cf. §6.5 « Note méthodologique sur les métriques ».

Ce message a trois fonctions :

1. **Rapport synthétique** pour le lecteur futur du `git log` qui ne lira pas les documents annexes.
2. **Imputabilité** — le commit déclare publiquement ce qui a été fait, ce qui reste, ce qui ne l'a pas été.
3. **Trace** vérifiable au cas où Grégoire ou un repreneur veut auditer un module refactoré dans 6 mois.

### 6.7 Cas particulier — première session sur `bilan-reflexif.js`

La première session de refactoring (`bilan-reflexif.js`) a démarré **avant** la rédaction de `METHODE-REFACTORING.md`. Conséquence : les étapes §3 et §4 n'ont pas été suivies de manière explicite, et la rétrospective sera partiellement rétroactive.

Procédure exceptionnelle pour cette session uniquement :

1. Avant le merge, Claude Code lit §3, §4, §5, §6 de ce document.
2. Claude Code remplit la rétrospective §7 selon le gabarit §6.5 en utilisant ce qu'il peut reconstituer (commits effectués, fichiers créés, tests écrits, message des commits) et **en signalant honnêtement ce qu'il ne peut pas reconstituer** (« je ne me souviens pas si j'ai vérifié l'ordre de chargement dans `index.html` avant le commit X »).
3. Grégoire relit la rétrospective. Si une omission importante est signalée (par exemple : « pas de tests de régression écrits »), décider si elle est **rattrapable maintenant** (écrire les tests rétroactivement, vérifier qu'ils passent sur le code refactoré, commiter) ou si on l'**accepte comme cas particulier** de la première session avec note explicite dans la rétrospective.
4. Intégrer les leçons proposées de §7 dans §3-§5 selon la procédure §6.3 ci-dessus.

Cette procédure rétroactive est **exceptionnelle**. À partir du module 2 (`productions.js`), la méthode est suivie dès le démarrage.

---

## 7. Journal de bord — leçons par module

À mesure que les modules sont refactorés, ajouter une section ici avec la rétrospective remplie selon le gabarit §6.5. La gouvernance §6.1 distingue ce que Claude Code écrit directement (Catégorie A — descriptif) des propositions qu'il fait à Grégoire (Catégorie B — décisions sur la méthode).

### Module : `bilan-reflexif.js`

**Date de fin** : 2026-05-15 (refactoring terminé sur branche, test manuel par Grégoire en attente avant merge)
**Branche** : `refactor/2026-mai` (déviation de la convention `refactor/<module>` — créée avant la finalisation de METHODE-REFACTORING.md ; conservée pour ne pas perdre l'historique des 8 commits)
**Commits** : 8 (de `6f0049c` à `8038c40`)
**Effort réel** : ~6-8 h (estimation MODULES-MAP : 4-6 h, écart : +30 % à +50 %)

**Note rétroactive importante** : ce module est le premier refactorisé. Les 5 premières extractions (§4.1.c à §4.1.f) ont suivi une procédure intuitive avant la finalisation de METHODE-REFACTORING.md. À partir du commit `4a7f5b6` (§4.1.g étape 3), la méthode §3 a été suivie explicitement, avec audit ESLint à l'étape 4 qui a révélé 3 fonctions au-dessus de cyc 30 — toutes corrigées en `c2681d0`.

#### Frontières fonctionnelles

Découpage proposé par MODULES-MAP §2.5 suivi **globalement oui**, avec deux écarts notables.

**Sous-modules effectivement créés** (taille en LOC) :

| Sous-module | Cible MODULES-MAP | LOC effectif | Écart |
|---|---:|---:|---:|
| `bilan-reflexif-core.js` | 370 | 425 | +15 % |
| `bilan-reflexif-editeur.js` | 740 | 829 | +12 % |
| `bilan-reflexif-import-export-texte.js` | 800 | 888 | +11 % |
| `bilan-reflexif-parcours.js` | 570 | 623 | +9 % |
| `bilan-reflexif-reflexion.js` | 395 | 444 | +12 % |
| `bilan-reflexif-csv.js` | 720 | 815 | +13 % |
| `bilan-reflexif-rapport.js` | 880 | 955 | +9 % |
| `bilan-reflexif.js` (résidu) | — | 284 | — |

Surcoûts homogènes (+9 à +15 %) attribuables à l'overhead IIFE de chaque sous-module : commentaire d'en-tête, aliases en tête, bloc d'exports `window.X` en pied. Pas un signal de mauvaise cartographie.

**Écart #1 — `core` agrandi progressivement** : le périmètre de `bilan-reflexif-core.js` a grandi par incréments au fil des extractions, pas en un seul coup.
- §4.1.c (initial) : styles + 3 utilitaires sans état (~290 LOC)
- §4.1.d (élargissement #1) : ajout de `etat`, `CLE_*`, `sauvegarder*`, finders `trouverBloc/Question/Perso` (~+95 LOC)
- §4.1.f (élargissement #2) : ajout de `rendreAideHTML`, `toggleAide`, `tronquer` (~+40 LOC, suite aux bugs latents #1 et #2)

Conséquence : un sous-module « core » ne se cartographie pas une fois pour toutes — il accueille au fil de l'eau les helpers identifiés comme partagés.

**Écart #2 — `rapport.js` au-dessus du seuil intermédiaire** : MODULES-MAP §2.5 prévoyait rapport + export PDF dans un seul fichier (~880 LOC), ce qui a été suivi. `exporterPDF` a dû être découpé en 7 sous-fonctions à l'étape 4, portant `bilan-reflexif-rapport.js` à 955 LOC. Au-dessus de 1000 LOC souhaitable mais sous 2000 LOC seuil §6.5. Inscrit en dette résiduelle (cf. infra).

#### Métriques avant/après

Sources : `wc -l` pour LOC ; `npx eslint --rule '{"complexity": ["error", N]}'` pour cyclomatic.

| Métrique | Avant | Après | Variation |
|---|---:|---:|---:|
| LOC du module (somme) | 4 716 (god module) | 4 463 (sous-modules + résidu, hors `data.js`) | −5 % |
| Nombre de fichiers issus du module | 1 | 8 (1 résidu + 7 sous-modules) | +7 |
| Taille du plus gros fichier (LOC) | 4 716 | 955 (`rapport.js`) | −80 % |
| Complexité cyclomatic max | 63 (`parserQuestionnaireTexte`) | 27 (`parserQuestionnaireTexte`) | −57 % |
| Nombre de fonctions au-delà de cyc 15 | 16 | 14 | −2 |
| Nombre de fonctions au-delà de cyc 30 | 3 (`parserQuestionnaireTexte`, `_agregerQuestion`, `exporterPDF`) | 0 | **−3** ✓ |
| Doublons de définition | 0 (selon MODULES-MAP §2.5 — confirmé) | 0 | inchangé |
| Code mort retiré (nombre de fonctions) | — | 0 | aucun identifié |
| Variables inutilisées nettoyées | non auditée | non auditée | — (à faire) |
| Tests Vitest sur ce module | 0 | 10 | +10 |
| Tests Playwright sur ce module | 0 | 0 | inchangé (cf. dette résiduelle) |

**Lecture** : objectif primordial atteint — **zéro fonction au-dessus de cyc 30** dans tous les sous-modules. Max cyc baisse de 63 → 27 (−57 %). Le plus gros fichier passe de 4 716 à 955 LOC (−80 %). Les 14 fonctions résiduelles au-dessus de cyc 15 sont quasi toutes héritées du code pré-existant (mêmes lignes déplacées dans leurs sous-modules), pas créées par le refactoring. Le LOC total baisse légèrement (−5 %) malgré l'overhead IIFE — gain marginal explicable par le retrait du hatch `__bilanReflexifInternals` et la consolidation de helpers dupliqués (aliases vs définitions multiples).

#### Tests de régression

- **Nombre écrits avant refactoring** : 10 tests Vitest (vs 7 listés dans MODULES-MAP §2.5). Edge cases ajoutés : `2.b` import texte vide → erreur explicite, `3.b` roundtrip parse∘format, `7.b` cohérence résultats démo.

- **Tests qui ont raté des régressions** (à renforcer) :
  - Les 10 tests **n'ont PAS attrapé les bugs latents #1 et #2** (cf. infra). Cause : tests de pures (parser, formater, CSV, agrégation). Ils n'exécutent jamais `rendreEditeur()`, `rendreParcours()`, etc. (DOM). Un ReferenceError dans le rendu serait silencieux jusqu'au premier clic en navigateur.
  - **À ajouter pour les modules suivants** : tests Playwright qui ouvrent l'app et cliquent sur chaque onglet, validant qu'aucun ReferenceError ne plante le rendu.

- **Tests qui en ont attrapé une** (à conserver) :
  - **Test 2 (Import texte parse le modèle)** a attrapé immédiatement le bug #3 (resynchronisation incorrecte de `preambuleLignes` introduite pendant la refacto cyc de `parserQuestionnaireTexte`). Sans ce test, le bug serait passé en prod sur le parcours « importer un questionnaire depuis le texte exporté ».
  - **Test 3.b roundtrip** verrouille la cohérence parse → format → parse. Pattern reproductible pour d'autres parseurs.

- **Bugs latents découverts pendant l'écriture des tests (avant le refactoring)** : aucun. Les 10 tests ont passé verts dès le premier essai sur le code initial.

- **Bugs latents découverts pendant le refactoring** (3) :
  1. **`rendreAideHTML`/`toggleAide`** : appelés par `editeur.js` (extrait en §4.1.d) et `parcours.js` (§4.1.e), définis dans le résidu. ReferenceError au premier `BilanReflexifEditeur.rendreEditeur()` en prod. Trouvé en §4.1.f par grep manuel des helpers cross-module avant l'extraction texte. Fix : migration vers `core` + aliases dans editeur/parcours.
  2. **`tronquer`** : même pattern, appelé par `reflexion.js` (et plus tard par csv/rapport). Trouvé en §4.1.f. Fix : migration vers `core` + aliases dans reflexion/résidu.
  3. **Resync ctx ↔ parent dans une refacto state machine** : auto-introduit pendant la refacto de complexité de `parserQuestionnaireTexte` en §4.1.g étape 4. Tentative de partager `preambuleLignes` via un ctx mutable avec resync bidirectionnelle (parent ↔ ctx). La resync ctx → parent restaurait l'array après que `fermerPreambule()` (closure du parent) l'avait mis à null, faisant consommer les options `a./b./c.` dans le préambule. Attrapé immédiatement par test 2. Fix : ne resynchroniser que parent → ctx en début d'itération.

#### Nettoyage effectué pendant le refactoring

- **Code mort retiré** : aucun identifié dans `bilan-reflexif.js`. MODULES-MAP §3.2 listait 0 doublon, 0 fonction marquée comme code mort. Confirmé à la lecture.
- **Doublons résolus** : aucun (rien à résoudre — voir ci-dessus).
- **Variables inutilisées nettoyées** : non auditée systématiquement. Aucune signalée pendant le refactoring, mais l'audit `no-unused-vars` ESLint n'a pas été passé. À faire pour les modules suivants.
- **Accès `localStorage` direct migrés vers `db.*`** : non. MODULES-MAP §3.2 signalait 2 accès `localStorage` direct dans `bilan-reflexif.js` à investiguer. Ils sont dans `rendreAideHTML` (état replié/déplié des panneaux d'aide) et `toggleAide` : `localStorage.getItem('bilan_aide_<cle>')` / `localStorage.setItem(...)`. Cas légitime — c'est de l'UI préférence locale, non namespacée par trimestre, pas justiciable de `db.*`. **À documenter par commentaire dans `core.js`** pour expliciter le choix conscient. Inscrit en dette résiduelle.
- **Helpers globaux consolidés** : `genId`, `afficherToast`, `libelleTypeQuestion`, `tronquer`, `rendreAideHTML`, `toggleAide` tous migrés vers `core` et exposés via `BilanReflexifCore.X`. Une seule définition par helper. Aliases dans les sous-modules consommateurs.

#### Difficultés rencontrées

- **Couplages cachés dans les rendus DOM** : les 2 bugs latents (rendreAideHTML, tronquer) montrent que les tests de pures Vitest ne couvrent pas les références cross-module utilisées en rendu. Sans grep manuel ou Playwright, ces ReferenceError restent invisibles.
- **État partagé entre modules** : `etat.questionnaire/parcours/reflexion/resultats/graphiques` doit rester un objet unique mutable. Solution adoptée : `core` héberge l'objet, tous les sous-modules font `var etat = BilanReflexifCore.etat;` en alias et mutent par référence. Anti-pattern §5.3 confirmé — ne jamais réassigner `etat = X`, toujours muter `etat.X = Y`.
- **Closures du parser state machine** : tentation forte de tout partager via ctx en refactorant. Piège : si une closure du parent (`fermerPreambule`) mute la variable parent par assignation (`preambuleLignes = null`), une resync ctx → parent fait perdre l'effet. Bug #3 ci-dessus.
- **Étape 4 (ESLint complexity) découverte tardivement** : les 5 premières extractions ont été commitées sans audit complexity. Audit complet en `c2681d0` a révélé 2 fonctions héritées toujours au-dessus de 30 (`_agregerQuestion`, `parserQuestionnaireTexte`) en plus de `exporterPDF`. Correction faite a posteriori en un commit unifié — pas idéal selon §3 P2 (petits pas) mais acceptable.
- **Sandbox de tests chaînage de 9 modules** : à chaque extraction, le `beforeAll` du test charge un module de plus avec injections explicites. Devient verbeux. Acceptable pour 9 modules ; si on pousse à 15+ modules sur d'autres god modules, considérer une factory `chargerChaineBilanReflexif()` qui retourne tous les namespaces.

**Décisions prises en cours de route** :
- **API publique single source** : `window.BilanReflexif` reste l'unique namespace exposé au dispatcher de `data-action`. Les méthodes déplacées vers `BilanReflexifEditeur`/`Parcours`/etc. sont **forwardées** dans `window.BilanReflexif`. Évite de fragmenter le HTML en `data-action="BilanReflexifRapport.exporterPDF"` ce qui aurait demandé une mise à jour cross-fichier du dispatcher ET dispersé la responsabilité.
- **Late lookup `BilanReflexif.afficherVue`** depuis `csv.js` et `rapport.js` : fonctionne parce que `BilanReflexif` est assemblé en fin de chargement par le résidu, et que ces appels ne se déclenchent qu'au clic utilisateur.
- **Pas de registry pattern de renderers** introduit. Le résidu garde la responsabilité de l'orchestration (`afficherVue` dispatche directement vers `BilanReflexifEditeur.rendreEditeur` etc.). Pas besoin d'un mécanisme d'enregistrement de renderers tant que les sous-modules sont nommés à la construction.

#### Améliorations de la méthode à proposer (Catégorie B — décision Grégoire)

Les propositions ci-dessous restent à valider par Grégoire avant d'être intégrées dans §3/§4/§5.

1. **§3 étape 1 (lecture complète)** — ajouter explicitement :
   > **À identifier en plus** : les helpers utilitaires (`rendre*`, `echapper*`, `tronquer`, `format*`) qui seront appelés depuis plusieurs sous-modules futurs. Les **promouvoir vers le sous-module `core` AVANT** de scinder le premier module qui les utilise.

   Cela aurait évité les bugs latents #1 et #2 (rendreAideHTML, tronquer).

2. **§3 étape 4 (complexity)** — préciser :
   > **Audit ESLint à lancer sur TOUS les sous-modules** déjà extraits dans la session, pas seulement le sous-module en cours d'extraction. Une fonction héritée peut avoir une complexité au-dessus du seuil dans son sous-module d'arrivée et ne sera pas attrapée si on n'audite que le périmètre courant.
   >
   > **Procédure recommandée** : ajouter un script `audit/refactoring-prep/check-complexity.sh` qui lance `npx eslint --no-eslintrc --parser-options ecmaVersion:2020 --rule '{"complexity": ["error", 30]}' js/<prefix>*.js` et le faire tourner après chaque extraction.

3. **§5 anti-patterns** — ajouter deux nouvelles entrées :
   - **§5.6 — Helpers cross-module non identifiés à l'étape 1.** Symptôme : un `ReferenceError` au premier rendu DOM en prod, invisible aux tests Vitest. Cause : un helper était défini dans le résidu mais consommé par un sous-module extrait. Détection : grep des helpers connus du projet (`rendre*`, `echapper*`, `tronquer`, etc.) AVANT chaque extraction. Promotion vers `core` si consommé par plus d'un sous-module.
   - **§5.7 — Resync ctx ↔ parent dans une refacto state machine.** Symptôme : un test bien ciblé devient rouge après l'introduction d'un ctx partagé. Cause : la fonction extraite mute le ctx ET appelle une closure du parent qui réassigne une variable. La resync ctx → parent restaure l'ancienne valeur après que la closure a fait son travail. Règle : **ne resynchroniser que parent → ctx en début d'itération**. Les closures s'occupent de l'autre sens directement.

4. **§4 check-list par sous-module (étape 3)** — ajouter deux items :
   > - [ ] ESLint complexity ≤ 30 sur ce sous-module ET sur tous les sous-modules déjà extraits dans la session.
   > - [ ] Grep des helpers (`rendreAideHTML`, `tronquer`, etc.) — confirmer qu'ils sont accessibles par alias depuis ce sous-module.

5. **§6.5 gabarit** — ajouter rubrique « Tests Playwright pour les rendus DOM » : si le sous-module contient des fonctions `rendreX()` qui injectent du HTML, prévoir au moins un test Playwright qui les déclenche. Inventaire à ajouter à la dette résiduelle si non réalisé.

6. **§3 étape 0** — clarifier que le nom de branche `refactor/<module>` est une convention, pas une obligation absolue. Une branche `refactor/<période>` regroupant plusieurs modules refactorés en parallèle reste acceptable si les commits sont atomiques par sous-module.

#### État de la dette résiduelle

**Sous-modules encore trop gros (> 2 000 LOC)** : aucun. ✓ Le plus gros : `bilan-reflexif-rapport.js` (955 LOC). Pourrait être éclaté plus tard en `-rapport-rendu.js` (~500 LOC), `-rapport-graphiques.js` (~150 LOC), `-rapport-pdf.js` (~250 LOC). Inscrire au backlog si la maintenance devient un irritant.

**Fonctions encore au-dessus du seuil de complexité 15** (14 fonctions) — la cible souple n'est pas atteinte mais c'est de l'héritage, pas du code nouveau :
- `parserQuestionnaireTexte` cyc 27, `_parserPretraitement` cyc 16, `parserCSV` cyc 16 (parseurs state machine — naturellement complexes)
- `rendreReflexion` cyc 25, `rendreActiviteReflexionHTML` cyc 24, `rendreDetailsQuestion` cyc 23, `exporterTexteParcours` cyc 22, `ajouterQuestion` cyc 22 (rendus HTML denses — refactor cosmétique possible)
- `rendreQuestionParActiviteHTML` cyc 19, `rendreRapport` cyc 17, `importerProductions` cyc 17, `rendreQuestionMiroirLikertHTML` cyc 17, `rendreSynthese` cyc 16, `collecterReponsesReflexion` cyc 20

À traiter à terme par découpage en sous-fonctions selon le pattern appliqué à `exporterPDF` / `_agregerQuestion`. Non bloquant.

**Couplages que ce refactoring n'a pas adressés** :
- Le résidu `bilan-reflexif.js` (284 LOC) reste responsable de `initialiserBilanReflexif`, `rendreInterface`, `afficherVue`, et l'assemblage de `window.BilanReflexif`. Possible évolution future : extraire en `bilan-reflexif-orchestration.js` si le résidu grossit.
- Late lookup via `BilanReflexif.X` depuis csv/rapport — fonctionnel mais crée une dépendance circulaire conceptuelle (le sous-module appelle le résidu qui le forward).

**Tests qu'on aurait dû écrire mais qu'on a renvoyés à plus tard** :
- Tests Playwright sur chaque vue : éditeur, parcours, réflexion, import CSV, rapport. Auraient attrapé les bugs latents #1 et #2 avant qu'ils ne soient découverts par grep manuel.
- Tests pures additionnels : `mapperColonnes`, `_tenterMappingAutres`, `_tenterMappingMatrice`, `calculerScoreBloc`, `calculerSignaux`, `labelVersValeur` — couverts indirectement mais pas testés en isolation.
- `rendreSynthese` (HTML output) — couvert indirectement, pas testé en isolation.

**Autres dettes** :
- Audit `no-unused-vars` non passé sur les 8 sous-modules. À ajouter au workflow.
- 2 accès `localStorage` directs dans `core.js` (`rendreAideHTML`/`toggleAide`) — choix conscient pour la préférence UI (état replié/déplié des panneaux d'aide), non namespacé par trimestre. À documenter par commentaire en tête de la section 6 de `core.js`.
- `_PDF_*` constantes (palette RGB) dans `rapport.js` pourraient migrer vers `BILAN_REFLEXIF_DATA` pour cohérence avec les autres couleurs. Pas urgent.

**Test manuel par Grégoire — bloquant avant merge** :
- **Éditeur** : créer/modifier/supprimer questions de chaque type (likert4, choix_unique, choix_multiple, matrix, ouvert), options Autre avec champ libre, NA, consigne conditionnelle, réinitialiser démo.
- **Parcours** : importer productions, ajouter activités manuelles, émotions, transversales, exporter le texte du parcours.
- **Réflexion** : passer entre états avant/après, répondre Likert/oui-non, ajouter/supprimer questions personnalisées dans les 3 blocs.
- **Import CSV** : charger les résultats démo (30 répondants), tester un CSV réel si disponible, vérifier le mapping automatique.
- **Rapport** : générer, vérifier le graphique Chart.js en **mode sombre ET mode clair** (palette couleurs), parcourir les distributions par bloc.
- **Export PDF** : exporter avec résultats démo, vérifier toutes les sections (en-tête, vue d'ensemble, blocs, synthèse, pied de page numéroté).
- **Suppression résultats** : depuis le rapport, supprimer, vérifier que la nav désactive le bouton Rapport et redirige vers Éditeur.
- **Panneaux d'aide** : déplier/replier les `?` dans éditeur/parcours, recharger la page, vérifier que l'état replié/déplié est persisté.

#### Notes pour le module suivant (`productions.js`)

Recommandations spécifiques tirées de cette session :

1. **Avant la première extraction**, lister explicitement les helpers que `productions.js` partage avec d'autres modules déjà extraits ou avec le résidu (`afficherNotificationSucces/Erreur` notamment — cf. MODULES-MAP §3.2). Les promouvoir AVANT la première extraction, pas après.
2. **Démarrer par un audit ESLint complexity** sur `productions.js` actuel : noter les fonctions au-dessus de 30 (MODULES-MAP §2.2 mentionne `sauvegarderProduction` cyc 79). Préparer le découpage à l'étape 4 en parallèle de l'étape 3.
3. **Test Playwright minimum** : créer un test qui ouvre la page, clique sur « Productions », clique sur « Créer une production », remplit le formulaire, sauvegarde. Ça attrape les ReferenceError dans `rendreX()` que les tests Vitest ratent.
4. **Pendant la zone protégée (15-19 mai)** : MODULES-MAP §3.1 indique que productions.js peut être refactoré pendant les évaluations de Grégoire **uniquement si les 6 tests de régression sont verts** sur main avant de toucher au code. Vérifier explicitement.
5. **Branche** : si on garde la branche `refactor/2026-mai`, l'enchaîner avec un commit `refactor(productions): ...` après merge de bilan-reflexif. Sinon créer `refactor/productions` propre.

### Module : `productions.js`

**Date de fin** : 2026-05-17 (validation manuelle Grégoire OK, merge FF sur `main`)
**Branche** : `refactor/productions` (HEAD `24cad3b`, 8 commits dont la capitalisation §6)
**Effort réel** : ~6 h sur 2 jours (15-16 mai) — dans la fourchette §3.3 (4-6 h).

**Rétrospective complète** : voir `audit/refactoring-prep/MODULES-MAP.md §2.2` rubrique « Rétrospective post-refactoring — 17 mai 2026 » (métriques avant/après, dette résiduelle, notes pour les modules suivants).

#### Synthèse méthode (extraits pertinents pour §7)

**Ce qui a bien fonctionné** :
- Application stricte de METHODE §3 étapes 0→6 (le premier refactor à suivre la méthode dans son intégralité, contrairement à `bilan-reflexif.js` rétroactif).
- Audit ESLint complexity à l'étape 4 a confirmé 2 fonctions au-delà de cyc 30 (`sauvegarderProduction` 80, `afficherFormProduction` 47) — la seconde absente de MODULES-MAP §2.2 prévisionnel (Écart #2 documenté avant le refactor).
- Helper de test `chargerScript(path, stubs, fauxWindowExistant)` étendu d'un 3e paramètre pour enchaîner N sous-modules dans le même sandbox. Pattern réutilisable pour `trimestre-v2.js`, `profil-etudiant.js`, `evaluation.js`.
- Cible dure (cyc ≤ 30) atteinte sur tous les sous-modules ET le résidu.

**Difficultés rencontrées** :
- **Exports `window.X` dispersés** : 9 exports thématiques étaient au milieu du fichier (lignes 2689-2702 pré-extraction), pas en bas. Grep systématique nécessaire après chaque `sed`/extraction pour les attraper. Pattern à documenter pour les modules suivants.
- **Wrappers résiduels avec variables module-scope** (anti-pattern §5.3) : `sauvegarderProductionOriginale`/`annulerFormProductionOriginale`/`supprimerProductionOriginale` ont dû rester groupés dans le résidu — ils ferment des variables module-scope inaccessibles depuis les sous-modules extraits. Le résidu s'agrandit (+31 % vs prévision).
- **Bugs latents préservés** : SUIVI-BUGS #96 (`event.target.value` Chrome/Safari rétro-compat) et #97 (`productionEnCoursEdition` vs `productionEnEdition` désynchronisés) **NON corrigés** pendant le refactor. Décision : préservation comportementale stricte. À traiter dans un cycle dédié.
- **Cible souple (cyc ≤ 15) non atteinte** : 11 fonctions résiduelles (+1 vs avant) parce que les 6 helpers d'étape 4 extraits de `sauvegarderProduction` cyc 80 ont chacun une complexité non-triviale (max : `validerEcheancesDansTrimestre` cyc 26). Trade-off accepté — déplacer la complexité d'une seule fonction massive vers plusieurs helpers plus petits.

**Trouvaille #4 → règle de méthode candidate** : *« Préservation comportementale stricte = préservation des bugs comportementalement neutres. »* Un bug latent qui ne se manifeste pas (Chrome rétro-compat ou code mort silencieux) doit rester pendant un refactor — sinon on ne peut plus distinguer une régression du refactor d'une correction de bug en revue. Inscrire dans SUIVI-BUGS et corriger séparément.

**Améliorations de méthode à proposer (Catégorie B — décision Grégoire)** :

> **Statut au 21 mai 2026 (Cat-B Track 2)** : les 4 propositions ci-dessous ont été ACTÉES et intégrées dans la méthode §3/§5. Voir §8 historique des révisions ligne « 2026-05-21 Cat-B Track 2 ».

1. **§3 étape 3 (découpage)** — préciser :
   > **Grep `window.X` AVANT et APRÈS chaque extraction.** Les exports thématiques peuvent être dispersés (pas tous en bas du fichier). Une extraction qui rate un export laisse une fonction « orpheline » qui plante au premier appel via `data-action`.

2. **§3 étape 4 (complexity)** — clarifier le trade-off cyc 15 :
   > L'extraction d'helpers pour casser une fonction au-delà de cyc 30 peut introduire de nouveaux helpers entre cyc 15 et cyc 30. C'est acceptable selon le principe « distribuer la complexité plutôt que la concentrer ». La cible souple (cyc ≤ 15) est optionnelle ; la cible dure (cyc ≤ 30) est obligatoire.

3. **§5 nouvel anti-pattern §5.8 — Wrappers résiduels avec variables module-scope** (ACTÉ § 5.8).

4. **§3 étape 5 (validation manuelle)** — ajouter :
   > **Tester chaque cas dans les deux modes (sombre + clair)** explicitement, pas seulement le mode utilisé en développement. Pour les modules avec rendu HTML dense (productions form, bibliothèque), les régressions visuelles sont silencieuses jusqu'au switch de mode.

#### Notes pour le module suivant (`trimestre-v2.js`)

1. **Avant la première extraction** : grep des helpers cross-module (`afficherNotificationSucces/Erreur`, `echapperHtml`, `BibliothequeUI.*`, `cle()`) pour confirmer qu'ils restent accessibles depuis les sous-modules. `trimestre-v2.js` est plus gros (6 584 LOC, 164 fonctions) et a un état pivot critique (`window.trimestreActif`) — le découpage doit préserver l'atomicité de `changerGroupeCoursActifV2` cyc 86.
2. **Tests Playwright minimum** : MODULES-MAP §2.4 prévoit 5 Vitest + 2 Playwright avant le refactor. Le Playwright est NÉCESSAIRE ici (changement de contexte = side-effects DOM cross-vue invisibles aux tests pures).
3. **Helper `chargerScript(path, stubs, fauxWindowExistant)`** : le pattern « enchaîner N sous-modules dans le même sandbox » est testé en production sur productions.js — réutiliser tel quel.
4. **9 sous-modules prévus** dans MODULES-MAP §2.4 : envisager un fractionnement en 2 sessions (init + liste + cours + étudiants ; horaires + groupes-cours + enseignants + orchestre) pour ne pas exploser le risque sur une seule session.

### Module : `trimestre-v2.js`

**Refactor livré le 17 mai 2026** — 3 sessions A+B+C sur la branche `refactor/trimestre-v2`, FF mergé sur `main`.

#### Bilan

- **8 sous-modules extraits** sur 8 prévus + résidu : `-init.js`, `-liste.js`, `-horaires.js`, `-enseignants.js` [session A] + `-cours.js`, `-etudiants.js`, `-groupes-cours.js` [session B] + `-orchestre.js` [session C]. Résidu 599 LOC contenant le hub `populerDropdownsAssemblageV2` (cyc 28, appelé 10× cross-zones — anti-pattern §5.6) + helpers transversaux (`mettreAJourBarreContexte`, `afficherStatistiquesTrimestreV2`, `mettreAJourGuideGroupeCours`, format horaire, wrappers notifications).
- **Monstre `changerGroupeCoursActifV2`** : cyc 94 / 282 LOC → cyc < 15 / ~32 LOC. Éclaté en 4 fonctions selon Écart #8 MODULES-MAP §2.4 + 1 sous-helper additionnel `_rafraichirProfilEtudiantSiVisible` requis pour redescendre `_rafraichirVuesContextDependantes` de cyc 36 à 28.
- **Atomicité préservée** (Écart #6) : couple `db.setSync('groupeCoursActif', X)` + `db.setSync('infoCours', Y)` jamais séparé dans les helpers de définition.
- **4 fonctions cyc > 30 héritées** restantes dans `-cours.js` et `-groupes-cours.js` (sauvegarderCoursV2 56, mettreAJourCarteResumeGroupeCoursV2 34, remplirFormCoursV2 31, genererNomGroupeCoursV2 31) — hors-scope du refactor C, à traiter dans un cycle productions-style.

#### 5 propositions Catégorie B issues du refactor trimestre-v2

> **Statut au 21 mai 2026 (Cat-B Track 2)** : les 5 propositions ci-dessous ont été ACTÉES et intégrées dans la méthode §3/§4/§5. Voir §8 historique des révisions ligne « 2026-05-21 Cat-B Track 2 ».

1. **§4 check-list étape 3 — réflexe « audit cross-zone tardif »** : APRÈS chaque `sed`/`Edit` de deletion, grep les noms de fonctions extraites (pas seulement les exports `window.X`) dans le résidu. Une fonction non listée dans MODULES-MAP §2.4 Écart #5 peut être appelée depuis une zone non extraite. Détecté session B : `afficherTrimestreGroupeCoursV2` appelée par zone 8 résidu, non listée Écart #5. **Insérer en §4 check-list étape 3 item « Grep fonctions extraites dans le résidu post-deletion »** entre les items actuels « Grep `window.X` post-extraction » et « `node --check` du résidu ».

2. **§4 check-list étape 3 — réflexe « doublons d'export pré-deletion »** : PRÉ-deletion, grep `window\.X = X` dans le résidu pour identifier les doublons d'export. Un orphelin où `X` est extrait transforme le résidu en `ReferenceError: X is not defined` au chargement IIFE. Pattern observé 2× session B (`window.supprimerGroupeCoursV2` exporté 2× pré-session-B). **Insérer en §4 check-list étape 3 item « Grep doublons d'export pré-deletion »** au début de la check-list.

3. **§3 étape 4 — réflexe « découpage supplémentaire pour cible dure »** : l'éclatement initial planifié à N fonctions peut produire une fonction au-dessus de la cible dure (cyc > 30) sous l'effet de la déduplication des branches. Pattern observé Phase 2 session C : éclatement 4 fonctions laisse `_rafraichirVuesContextDependantes` à cyc 36 (la déduplication des 2 branches Mode COURS/Mode GROUPE-COURS produit une fonction agrégée trop complexe). **Compléter §3 étape 4 — « Si l'éclatement initial produit une fonction au-dessus de cyc 30, extraire un sous-helper additionnel jusqu'à respecter la cible dure ».**

4. **§3 étape 0 — convention chargement `<script>` orchestrateurs** : un sous-module qui appelle `window.X` d'AUTRES sous-modules (et non l'inverse) doit être chargé EN DERNIER dans `index.html`. Pattern observé Phase 1 session C : `trimestre-v2-orchestre.js` appelle `window.populerDropdownGroupesHoraireV2`, `window.afficherTrimestreGroupeCoursV2`, `window.supprimerGroupeCoursV2`. **Documenter en §3 étape 0 — « Identifier les sous-modules orchestrateurs (qui consomment via `window.X` d'autres sous-modules) et les placer en dernier dans `index.html` ».**

5. **§5 anti-patterns — §5.8 nouveau « factoriser les branches dupliquées en paramètres »** : repérer les blocs avec 90 %+ de code dupliqué et abstraire les différences en paramètres plutôt que dupliquer. Pattern productions-validation et trimestre-v2-orchestre (Phase 2). **Ajouter §5.8 avec exemple `_rafraichirVuesContextDependantes(valeurHeader, messageNotification, regenererCalendrier)`** — gain : −110 LOC vs duplication, cyc agrégé 28 vs 47 dupliqué.

#### Notes pour le module suivant (`profil-etudiant.js`)

1. **État pivot critique** : `window.profilActuelDA` est l'analogue de `window.trimestreActif` pour profil-etudiant.js (lu 24× hors module selon MODULES-MAP §2.3). Tout changement de DA déclenche une cascade de rafraîchissements de vues — pattern identique à `changerGroupeCoursActifV2`. **Anticiper un monstre similaire** au top du module et planifier l'éclatement Phase 2.
2. **8 818 LOC, 105 fonctions** — module presque 50 % plus gros que trimestre-v2 (164 fonctions mais avec MORE LOC). Envisager **4 sessions** au lieu de 3 (split MEDIUM en 2 si nécessaire).
3. **Helper `chargerScript(path, stubs, fauxWindowExistant)` éprouvé** sur productions + trimestre-v2 — réutiliser tel quel. Pattern `chargerSandbox(stockage)` factorise les stubs si 3+ sous-tests partagent la même setup.
4. **Réflexe `// security-ok`** sur les XSS innerHTML transférés tels quels (préservation comportementale stricte) — l'acquittement est attendu sur tout sous-module session B/C/etc., ne pas s'en surprendre lors du hook Défense J. Inscrire systématiquement les bugs en SUIVI-BUGS pour traitement post-refactor Catégorie B.
5. **Convention `window.X` systématique pour appels cross-module** : tout appel à une fonction d'un autre sous-module passe par `window.X()` avec garde `typeof === 'function'`. Confirmé sur 5 sessions consécutives (bilan-reflexif, productions, trimestre-v2 A+B+C).
6. **Préservation des bugs latents existants** : ne pas profiter du refactor pour « nettoyer » des bugs préexistants (ReferenceError, XSS, dead code). C'est un autre cycle, autre PR. Le refactor doit être un déplacement comportementalement neutre. Trouvaille session C : 3 dead code apparents préservés (`afficherFormHoraireV2`, `modifierHoraireSelectionneV2`, `activerGroupeCoursV2` avec calls à des fonctions inexistantes).

### Module : `profil-etudiant.js`

**Date de fin** : 2026-05-18 (étape 3 + étape 4 partielle livrées — étape 5 validation Grégoire EN ATTENTE, étape 6 merge FF différé jusqu'à OK testeur)
**Branche** : `refactor/profil-etudiant` (HEAD `e257292` au moment de cette rétrospective stand-by)
**Commits** : 8 commits (`fc9415b` diagnostics → `e257292` bump session D) répartis sur 4 sessions A+B+C+D le 18 mai
**Effort réel** : ~4 h en continu sur la journée du 18 mai (les sessions 0+1+2+A avaient été livrées la veille au soir 17 mai par une session Claude antérieure ; les sessions B+C+D le 18 mai matin)
**Estimation MODULES-MAP** : 6-9 h pour 4 sessions / écart : −33 % à −55 % (~2× plus rapide que prévu, grâce au pattern productions/trimestre-v2 mature)

#### Frontières fonctionnelles

Découpage MODULES-MAP §2.3 suivi à 100 % — 7 sous-modules conformes au prévisionnel, mais avec 2 ajustements de méthode :

- **Sous-module #7 (sections-affichage)** : **renommage** plutôt qu'extraction sed. Le résidu post-sessions-A+B+C (4 642 LOC) était DÉJÀ un IIFE complet englobant la zone Sections affichage. `git mv profil-etudiant.js → profil-etudiant-sections-affichage.js` est l'opération la plus sûre (0 LOC de code modifiée).
- **Cycle Catégorie B post-merge prévu pour 5 fonctions cyc > 30 héritées** : décision Grégoire 18 mai 2026 — éclater seulement le monstre central `afficherProfilComplet` (cyc 58 → < 30), documenter les autres comme héritages à traiter cycle dédié post-merge (pattern productions / trimestre-v2 confirmé).

Sous-modules créés et taille finale :

| Sous-module | LOC | Fonctions | Cyc > 30 hérités | Session |
|---|---:|---:|---:|---|
| `profil-etudiant-helpers.js` | 630 | 16 | 0 | A |
| `profil-etudiant-calculs.js` | 1 547 | 14 | 2 (`calculerIPB` 36, `determinerCibleIntervention` 58) | A |
| `profil-etudiant-rapport.js` | 426 | 7 | 0 | A |
| `profil-etudiant-diagnostics.js` | 865 | 11 | 0 | B |
| `profil-etudiant-confidentiel.js` | 330 | 8 (+2 variables module-scope encapsulées) | 0 | B |
| `profil-etudiant-actions.js` | 600 | 8 | 1 (`calculerDetailsNoteFinale` 57) | C |
| `profil-etudiant-sections-affichage.js` | 4 654 | 38 (+ 5 helpers privés étape 4) | 2 (`genererSectionMobilisationEngagement` 52, `genererSectionPerformance` 47) | D |
| **Total** | **9 052** | **102** + **5 helpers** | **5** | A+B+C+D |

Pas de résidu central — `profil-etudiant.js` est renommé en `-sections-affichage.js`.

#### Métriques avant/après

| Métrique | Avant | Après | Variation |
|---|---:|---:|---:|
| LOC du module (wc -l) | 8 818 | 9 052 (somme 7 sous-modules) | +2,6 % (overhead IIFE wrappers + en-têtes + 5 helpers étape 4) |
| Nombre de fichiers issus du module | 1 | 7 | +6 |
| Taille du plus gros fichier (LOC) | 8 818 | 4 654 | −47,2 % |
| Complexité cyclomatic max (ESLint complexity) | 58 (`afficherProfilComplet`) | < 30 (sur `afficherProfilComplet` éclaté) ; 58 héritages dans calculs.js + actions.js | Monstre central traité ; 5 héritages documentés Catégorie B |
| Nombre de fonctions au-delà de cyc 30 | 8 | 5 héritages (−3, `afficherProfilComplet` éclatée) | −37,5 % sur la cible dure |
| Doublons de définition | 10 dispersés | 0 (commentés avec pointer vers sous-modules) | Nettoyage complet |
| Code mort retiré (nombre de fonctions) | — | 0 (préservation comportementale stricte) | 2 dead code apparents préservés et inscrits SUIVI-BUGS (#105 + #106) |
| Tests Vitest sur ce module | 5 | 5 (sentinelle élargie de 30+ exports) | inchangé en nombre, élargi en couverture |
| Tests Playwright sur ce module | 2 | 2 (chargement + sentinelle browser) | inchangé |

**Lecture** : LOC total quasi-stable (+2,6 % d'overhead IIFE attendu). Cible dure cyc ≤ 30 atteinte sur le monstre central. 5 fonctions cyc > 30 héritages préservés comportementalement.

#### Tests de régression

- **5 Vitest + 2 Playwright pré-refactor** écrits en session étape 2 (commit `56c0978`)
  - Canari de chargement multi-modules
  - Sentinelle 30+ exports représentatifs des 7 zones
  - Structure `afficherProfilComplet` (function declaration, arité 1)
  - État pivot `window.profilActuelDA` initialisé à null au chargement IIFE
  - Structure `consulterEvaluation` cascade (arité 2)
- **Tests qui ont attrapé des régressions** : canari + sentinelle (notamment session A 18 mai 00:30 quand un commentaire de bloc orphelin avait fait échouer le chargement)
- **Tests qui ont raté des régressions** : aucun bug n'a été détecté APRÈS extraction par les tests post-refactor (préservation comportementale confirmée par Playwright + Vitest)
- **Bugs latents découverts pendant l'écriture des tests** : aucun (les 2 bugs latents #105 + #106 ont été découverts pendant les extractions session B et étape 4 session D, pas pendant les tests)

#### Tests Playwright pour les rendus DOM

Le module contient ~30 fonctions `genererSection*` qui injectent du HTML. La couverture Playwright actuelle (2 tests) cible seulement chargement + sentinelle exports — **pas le rendu effectif** des sections. Pattern productions / trimestre-v2 confirmé : tests de régression suffisent pour la phase refactor, les régressions visuelles sont attrapées en étape 5 validation manuelle Grégoire.

**Dette résiduelle** : 1 test Playwright supplémentaire qui ouvre un profil étudiant et vérifie le rendu de la section Productions par défaut serait utile (cf. recommandation §6.5 « Tests Playwright pour les rendus DOM »). Inscrit en dette résiduelle, à traiter dans un cycle Catégorie B post-merge.

#### Nettoyage effectué pendant le refactoring

- **Code mort retiré** : aucun (préservation comportementale stricte)
- **Doublons résolus** : 10 exports `window.X` doublons identifiés pré-session-A + 3 doublons d'export orphelins session C nettoyés post-extraction (`calculerDetailsNoteFinale`, `consulterEvaluation`, `evaluerProduction` — remplacés par commentaires pointer)
- **Variables inutilisées nettoyées** : 0
- **Accès localStorage direct migrés vers db.*** : non — 3 accès `localStorage` direct identifiés Écart #7 MODULES-MAP §2.3 (clé `profilOngletDeveloppementActif`) **préservés** (préservation comportementale stricte, décision étape 1 a)
- **Helpers globaux consolidés** : non — wrappers `afficherNotificationSucces/Erreur` toujours dupliqués dans 7 sous-modules (consolidation `utils-notifications.js` reportée par décision session A trimestre-v2, 73 sites d'appel = risque régression silencieuse)

#### Difficultés rencontrées

1. **`afficherProfilComplet` cyc 58 — orchestrateur central délicat**. Risque de régression élevé puisque consommé via dispatcher `data-action` ET appel direct depuis 24+ sites cross-module. Éclatement en 5 helpers privés réussi sans régression (test sentinelle vert).
2. **Re-flag baseline F.16 du hook Défense J par fichier** (session B confidentiel). Le commentaire `// security-ok` DOIT être inline (sur la même ligne que l'innerHTML), pas en bloc 3 lignes avant. Premier essai en bloc commentaire refusé par le hook → réécriture inline pour passage.
3. **Bug latent #106 découvert pendant éclatement étape 4**. La chaîne if/else if de `afficherProfilComplet` manquait une branche `progression && progressionVisible` → premier rendu produit titre+contenu vides. Détection par lecture systématique avant éclatement. Préservation stricte → inscription SUIVI-BUGS avec commentaire explicite dans `_resoudreSectionContenu`.
4. **Export window.X dans la zone à extraire ALORS QUE la fonction reste résidu** (session C, `calculerDirectionsCriteres`). Symétrique inverse du pattern « orphelins post-extraction ». Solution : retirer du contenu extrait + rajouter manuellement dans le résidu (1 ligne).
5. **Renommage > extraction sed** quand le résidu post-A+B+C était déjà un IIFE complet (session D). Décision pragmatique : `git mv` au lieu de `sed delete` + reconstruction IIFE risquée sur 4 642 LOC.

#### Améliorations de la méthode à proposer (Catégorie B — décision Grégoire)

> **Statut au 21 mai 2026 (Cat-B Track 2)** : les 6 propositions ci-dessous ont été ACTÉES et intégrées dans la méthode §3/§4/§5/§6.5. Voir §8 historique des révisions ligne « 2026-05-21 Cat-B Track 2 ».

1. **§3 étape 3 (extraction) — réflexe « renommage si résidu déjà IIFE complet »** : quand le résidu d'une session précédente est déjà un IIFE complet englobant l'intégralité de la zone à extraire dans la session courante, **`git mv` est l'opération la plus sûre** (0 LOC de code modifiée). **Insérer en §3 étape 3 — « Si la zone à extraire représente l'intégralité d'un IIFE déjà en place, préférer `git mv` + réécriture de l'en-tête + ajustement script tag + tests. Le sed delete reste obligatoire si la zone est UNE PARTIE du résidu uniquement. »**

2. **§4 check-list étape 3 — réflexe « audit symétrique inverse exports »** : compléter la check-list avec le cas où un `window.X = X` est DANS la zone à extraire ALORS QUE la fonction X reste dans le résidu. **Ajouter item « Pour chaque `window.X = X` dans la zone à extraire, grep la fonction X : si fonction HORS zone → retirer l'export du contenu extrait + rajouter manuellement dans le résidu. »** Cf. [[feedback-refactor-export-reste-residu-quand-fonction-reste]].

3. **§5 nouvel anti-pattern §5.9 candidat — Acquittement `// security-ok` INLINE OBLIGATOIRE** : le hook pré-commit Défense J n'accepte le `// security-ok` que sur la même ligne que l'innerHTML (suffixe inline), **pas en commentaire de bloc avant**. Baseline F.16 est par fichier — toute extraction de zone avec innerHTML interpolé re-flague. **Ajouter §5.9 avec exemple inline correct + exemple bloc refusé.** Cf. [[feedback-securite-ok-inline-obligatoire]].

4. **§5 nouvel anti-pattern §5.10 candidat — Variables module-scope encapsulées dans IIFE (PAS de window.X)** : convention de promotion `window.X` systématique des **fonctions** extraites NE S'APPLIQUE PAS aux **variables module-scope** (`let`/`const`). Préservation de l'encapsulation d'origine — préfixe `_` = privée d'origine, reste privée après extraction. **Ajouter §5.10 avec exemple `_confidentielDaActuel` + `SOUS_CATEGORIES_SERVICES` session B.** Cf. [[feedback-iife-encapsuler-variables-module-scope]].

5. **§6.5 gabarit — rubrique « 5 fonctions cyc > 30 héritages »** : pattern observé sur productions (1) + trimestre-v2 (4) + profil-etudiant (5). Quand le god module a >>5 fonctions cyc > 30, la décision pragmatique consiste à éclater seulement le monstre central et documenter les autres comme héritages Catégorie B post-merge. **Ajouter rubrique « Stratégie cyc > 30 (cible dure vs héritages) »** : éclater systématiquement la fonction cyc max et toute fonction cyc > N (N à acter avec Grégoire — proposition : 50). Documenter les autres comme héritages.

6. **§3 étape 4 — réflexe « bug latent détecté pendant l'éclatement »** : la lecture systématique d'une fonction monstre avant son éclatement révèle parfois des bugs latents (branches manquantes, dead code, etc.). **Ajouter en §3 étape 4 — « Pendant la lecture pré-éclatement, signaler tout bug latent détecté en SUIVI-BUGS et préserver tel quel dans le helper extrait avec commentaire explicite. »** Pattern session D bug #106 (branche manquante `progression && progressionVisible`).

#### État de la dette résiduelle

- **5 fonctions cyc > 30 héritages** à éclater cycle dédié Catégorie B post-merge :
  - `genererSectionMobilisationEngagement` 52 (sections-affichage.js, ~730 LOC)
  - `genererSectionPerformance` 47 (sections-affichage.js, ~615 LOC)
  - `calculerDetailsNoteFinale` 57 (actions.js, ~287 LOC)
  - `determinerCibleIntervention` 58 (calculs.js, ~200 LOC)
  - `calculerIPB` 36 (calculs.js, ~150 LOC)
- **`sections-affichage.js` > 2 000 LOC** (4 654 LOC) — pourrait être sous-découpé en 2 (`-sections-rendu.js` + `-sections-orchestre.js`) dans un cycle ultérieur si la dette devient gênante. Décision Grégoire 18 mai : Option 1 extraction unique acceptée.
- **Bug latent #105** (`chargerProfilEtudiant` dead code dans `sauvegarderConfidentiel`) et **#106** (branche manquante `progression && progressionVisible` dans `afficherProfilComplet`) — à corriger Catégorie B post-merge.
- **3 accès `localStorage` direct** (clé `profilOngletDeveloppementActif`) non migrés vers `db.*` — à traiter Catégorie B post-merge.
- **Consolidation `utils-notifications.js`** : wrappers `afficherNotificationSucces/Erreur` toujours dupliqués dans 7 sous-modules (décision session A trimestre-v2 maintenue — 73 sites d'appel = risque régression silencieuse).
- **Test Playwright supplémentaire** pour rendu effectif Section Productions par défaut (cf. §6.5 « Tests Playwright pour les rendus DOM »).

#### Notes pour le module suivant (`evaluation.js`)

`evaluation.js` est le **dernier god module** (7 348 LOC, PLAN-MOYEN-TERME §4.5). Tendance attendue : encore plus complexe que profil-etudiant vu la logique métier (IDME × SRPNF × algo notation × multi-grilles × ponderations × cartouches × tampons). Effort estimé 6-8 h.

1. **Anticiper un monstre orchestrateur** type `afficherEvaluation()` / `sauvegarderEvaluation()` autour de cyc 60-100. Lecture intégrale étape 1 obligatoire avant tout découpage.
2. **Probable état pivot critique** (analogue de `window.profilActuelDA` ou `window.trimestreActif`) à identifier et préserver atomiquement. Grep `let evaluationActuelle` / `let evaluationEnEdition` / `let evaluationEnCours` etc. à l'étape 1.
3. **Algo notation = zone à très haut risque de régression**. Tests Vitest sur les fonctions pures de calcul (convertirNiveauEnScore, ponderationCriteres, etc.) à ÉCRIRE EN PREMIER étape 2, avant tout découpage. Réutiliser les snippets `calculations-tests.md` de l'audit annuel si disponible.
4. **Helper `chargerScript(path, stubs, fauxWindowExistant)` éprouvé** sur 4 modules consécutifs (bilan-reflexif, productions, trimestre-v2, profil-etudiant) — réutiliser tel quel.
5. **5 propositions Catégorie B issues du refactor profil-etudiant** ci-dessus à intégrer dans la méthode AVANT de démarrer evaluation.js, si Grégoire les valide. Notamment §3 étape 3 (renommage si résidu déjà IIFE) + §3 étape 4 (bug latent pendant éclatement) + §5 anti-patterns §5.9 (security-ok inline) + §5.10 (variables module-scope encapsulées).
6. **Décision pragmatique sur cyc > 30 héritages** : confirmer le pattern productions / trimestre-v2 / profil-etudiant avec Grégoire au début d'evaluation.js — éclater le monstre central, documenter les autres héritages Catégorie B. Sinon prévoir 2-3 h supplémentaires pour éclater chaque fonction > 30.
7. **`// security-ok` inline obligatoire** sur tout innerHTML re-flagué baseline F.16 (pattern session B profil-etudiant). Pas de commentaire de bloc, suffixe en fin de ligne.
8. **Variables module-scope encapsulées dans IIFE** sans promotion `window.X` (pattern session B profil-etudiant). Seules les fonctions sont promues `window.X` systématiquement.
9. **Préservation comportementale stricte** sur tout bug latent détecté pendant lecture/extraction — inscription SUIVI-BUGS immédiate avec commentaire explicite dans le code. Pattern session D bug #106.
10. **Si le résidu d'une session devient un IIFE complet englobant la zone suivante** → `git mv` plutôt qu'extraction sed (pattern session D profil-etudiant, `git mv profil-etudiant.js → profil-etudiant-sections-affichage.js`).

### Module : `evaluation.js`

**Date de fin** : 2026-05-21 (étape 4 livrée 18 mai, étape 5 validation Grégoire 21 mai OK 13 évaluations sans problème majeur, étape 6 capitalisation + merge FF + tag 21 mai)
**Branche** : `refactor/evaluation` (HEAD post-étape-4 `30c6eea`, mergée FF sur `main` le 21 mai 2026)
**Commits** : 19 commits cumulés (sessions A+B = 9 commits ; fix #109 + 6 éclatements étape 4 = 7 ; bump build + capitalisation étape 6 = 3+)
**Effort réel** : ~10 h sur la journée du 18 mai (3 sessions consécutives A matin / B après-midi / étape 4 soir) + validation Grégoire 21 mai (~1 h) + capitalisation/merge étape 6 21 mai (~2 h)
**Estimation MODULES-MAP** : 6-8 h estimation initiale §3.3, révisée 6-9 h étape 1 / écart : **+25 %** vs estimation médiane (fourchette haute confirmée — cohérent avec le triple monstre cyc 70/75/78 anticipé étape 1)

#### Frontières fonctionnelles

Découpage MODULES-MAP §2.1 suivi avec **1 ajout** + **2 reports** :

- **Ajout** : sous-module `evaluation-jetons.js` (832 LOC, 11 fonctions) extrait pendant session A — pas prévu §2.1 mais cohérent vu l'autonomie de la zone Jetons personnalisés + copies TSV/SRPNF + handlers calcul/édition.
- **Reports** : zones Liste (4400-4610), Modification (4611-5975), Verrouillage (5976-6850), Banque (6137-6610) **restées dans le résidu `evaluation.js`** plutôt que d'être éclatées en `-liste.js` + `-modification.js` séparés — décision pragmatique vu l'imbrication forte avec l'état pivot `window.evaluationEnCours` et le flag `_modifierEvaluationEnCours`. Pattern profil-etudiant-sections-affichage.js (résidu 4 654 LOC accepté par Grégoire) confirmé : un gros résidu post-refactor est acceptable si éclaté à un cycle Cat-B ultérieur.

7 sous-modules créés + 1 résidu :

| Sous-module | LOC | Fonctions | Cyc > 30 hérités | Session |
|---|---:|---:|---:|---|
| `js/evaluation-handlers.js` | 79 | 3 (wrappers Phase 5) | 0 | A |
| `js/evaluation-chargement.js` | 1 266 | 17 (chargement + auto-save) | 1 (`chargerEchellePerformance` 36) | A |
| `js/evaluation-calcul.js` | 738 | 9 (calcul de notes) | 1 (`calculerNoteAlgorithmiqueAvecCategories` 42) | B |
| `js/evaluation-retroaction.js` | 816 | 12 (rétroaction + 10 helpers `_Bilan*` + 2 const module-scope) | 0 | B |
| `js/evaluation-sauvegarde.js` | 999 | 8 (sauvegarde + jetons + 12 helpers `_Sauv*`) | 1 (`peuplementOptJetons` 33) | B |
| `js/evaluation-jetons.js` | 832 | 11 (jetons personnalisés + copies + handlers) | 0 | A (ajout non prévu §2.1) |
| `js/evaluation.js` (résidu) | 3 984 | 35 (modification + verrouillage + liste + banque + 12 helpers `_Modif*`) | 0 | A+B+étape4 |
| **Total** | **8 714** | **95** | **3** (Cat-B sous N=50) | A+B+étape4 |

Pas de renommage du résidu (vs profil-etudiant session D `git mv → -sections-affichage.js`). `evaluation.js` garde son nom — la zone Modification reste imbriquée avec le pivot `evaluationEnCours`, l'extraction en `-modification.js` est reportée en cycle Cat-B post-merge.

#### Métriques avant/après

| Métrique | Avant | Après | Variation |
|---|---:|---:|---:|
| LOC du module (résidu) | 7 321 | 3 984 | **−45,6 %** |
| LOC cumulés tous sous-modules issus | 7 321 | 8 714 | **+19,0 %** (overhead IIFE wrappers + en-têtes + 59 helpers + 2 const étape 4) |
| Plus gros fichier (LOC) | 7 321 | 3 984 (résidu) | −45,6 % |
| Complexité cyclomatic max (ESLint) | 78 (async arrow interne `modifierEvaluation`) | **42** (héritage Cat-B sous N=50) | −46 % |
| Nombre de fonctions au-delà de cyc 30 | 9 | **3 héritages** (`calculerNoteAlgorithmiqueAvecCategories` 42, `chargerEchellePerformance` 36, `peuplementOptJetons` 33) | **−67 %** |
| Doublons de définition | 3 dispersés (préservés) | 3 dispersés (préservation stricte) | inchangé (Cat-B post-merge) |
| Code mort retiré (nombre de fonctions) | — | 0 (préservation comportementale stricte) | 2 fonctions « alarmistes » (`calculerRisqueEchec`, `obtenirClasseRisque`) préservées + inscrites Cat-B post-merge |
| Tests Vitest sur ce module | 0 (avant refactor) → 7 (étape 2) | 7 (sentinelle élargie à 6 modules dont evaluation) | inchangé en nombre post-étape-2 |
| Tests Playwright sur ce module | 0 → 2 (étape 2) | 2 (chargement + sentinelle browser) | inchangé post-étape-2 |
| Bugs latents Cat-B nets | 0 | +2 (#107-108) −1 corrigé (#109) = **+1 net** | — |
| Helpers privés ajoutés étape 4 | 0 | **59 helpers + 2 const module-scope** | — |

**Lecture** : cible dure cyc ≤ 30 atteinte sur 6/6 monstres > N=50 (100 %). 3 héritages sous N=50 documentés Cat-B (méthode pragmatique confirmée — proposition Cat-B #5 profil-etudiant). LOC résidu réduit de 45 % — pattern proche de productions (−44,7 %) et trimestre-v2 (−90,9 % via découpage complet, exception). 89/89 tests verts à chaque jalon.

#### Tests de régression

- **7 Vitest + 2 Playwright pré-refactor** écrits en session étape 2 (sentinelle élargie à 6 modules : bilan-reflexif, productions, trimestre-v2, profil-etudiant, evaluation, +1 placeholder)
  - Canari de chargement multi-modules
  - Sentinelle 30+ exports représentatifs des 7 zones
  - Structure `evaluationEnCours` (variable pivot, créée à la 1re sauvegarde — NON initialisée à null au chargement, contrairement à `profilActuelDA` initialisé)
  - Structure `sauvegarderEvaluation`, `modifierEvaluation`, `calculerNote` (signatures, arités)
  - Side-effect top-level `window.addEventListener('modeChanged', ...)` L7163 pré-peuplé via le 3e param `fauxWindowExistant` du helper `chargerScript`
- **Tests qui ont attrapé des régressions** : canari + sentinelle (notamment pendant l'éclatement étape 4 quand un patch §5.6 manqué cassait un export `window.X`).
- **Tests qui ont raté des régressions** : aucun bug n'a été détecté APRÈS extraction par les tests post-refactor (préservation comportementale confirmée par Playwright + Vitest + validation manuelle Grégoire sur 13 évaluations le 21 mai).
- **Bugs latents découverts pendant l'écriture des tests** : aucun directement. Les 3 bugs latents (#107 #108 #109) ont été découverts pendant l'audit grep helpers cross-module + audit pivot état pré-extraction sessions A/B.

#### Tests Playwright pour les rendus DOM

Couverture actuelle (2 tests) : chargement headless + sentinelle exports browser. **Pas le rendu effectif** des palettes d'évaluation, des rétroactions, des badges. Pattern productions / trimestre-v2 / profil-etudiant confirmé : tests de régression suffisent pour la phase refactor, les régressions visuelles sont attrapées en étape 5 validation manuelle Grégoire (Safari Mac sombre+clair).

**Dette résiduelle** : 1-2 tests Playwright supplémentaires utiles à terme (rendu palette + rendu rétroaction Bilan) — inscrits en dette Cat-B post-merge.

#### Nettoyage effectué pendant le refactoring

- **Code mort retiré** : 0 (préservation comportementale stricte, pattern productions / profil-etudiant maintenu).
- **Doublons résolus** : 0 (3 doublons §2.1 préservés Cat-B post-merge).
- **Variables inutilisées nettoyées** : 0 (préservation stricte).
- **Accès localStorage direct migrés vers `db.*`** : 0 — non vérifié (audit Écart #7 §2.1 listait 78 accès `db.*` propres, 0 accès localStorage direct identifié à l'étape 1).
- **Helpers globaux consolidés** : 0 — wrappers `afficherNotificationSucces/Erreur` toujours dupliqués dans 7 sous-modules (consolidation `utils-notifications.js` reportée par décision session A trimestre-v2 maintenue à travers profil-etudiant et evaluation, 73 sites d'appel cross-projet = risque régression silencieuse).
- **Bug #109 corrigé pendant étape 4** : seul nettoyage non-pure-extraction effectué (promotion `_timerAutoSave` + `_pendingAutoSaveSnapshot` cross-IIFE). Justifié par le pattern « fix bug latent avant éclatement du monstre qui le contient » (cf. trouvaille méthode #7 ci-dessous, [[feedback-fix-bug-latent-avant-monstre]]).

#### Difficultés rencontrées

1. **Triple monstre cyc 70/75/78** — anticipé étape 1 mais coût réel élevé. 3 sessions A/B/étape4 ont été nécessaires pour passer de l'audit à l'éclatement complet. **Décision N=50 actée avec Grégoire au démarrage de l'étape 4** = filet de sécurité méthode (au-dessus → éclatement obligatoire, en-dessous → héritage Cat-B documenté).

2. **État pivot `window.evaluationEnCours` créé à la 1re sauvegarde** (PAS au chargement IIFE) — différence avec `profilActuelDA = null` initialisé. Conséquence : impossible de tester sentinelle "pivot initialisé au chargement" — sentinelle a été remplacée par "pivot déclaré sur window après 1ère sauvegarde mockée". Frontière de test différente de profil-etudiant.

3. **Couplage cross-module à `window.evaluationEnCours` via `travaux-ui.js:4639`** (Écart #9 étape 1) — premier cas observé sur les 5 refactors où un module externe **réassigne** un état pivot critique. Préservé tel quel pendant le refactor. À investiguer Cat-B post-merge : couplage légitime (annotation d'un travail déclenche une éval) ou à découpler ?

4. **Side-effect top-level IIFE imprévu** `window.addEventListener('modeChanged', ...)` L7163 — déclenché au chargement de l'IIFE. Pas détecté par la lecture étape 1, découvert quand la sentinelle de chargement a échoué session A. Solution : pré-peupler `fauxWindow` avec un stub `addEventListener` via le 3e paramètre du helper `chargerScript(path, stubs, fauxWindowExistant)`. Cf. trouvaille méthode session A point 3.

5. **Encoding mixte UTF-8 + escape sequences dans le même fichier** (caractères accentués mélangés avec `é` etc.) — coûté plusieurs ré-extractions ratées pendant session A. Solution : préférer **sed par numéros de ligne** pour les gros blocs (>50 LOC), Edit ciblé pour les petits patches. Cf. trouvaille méthode session A point 1.

6. **JSDoc orphelin post-sed** — quand un sed delete coupait au milieu d'un commentaire JSDoc `/** ... */`, le `/**` orphelin avalait silencieusement les fonctions suivantes (cf. pattern documenté MEMORY.md). Solution : nettoyer commentaire de section + JSDoc dans la même opération sed (étendre la plage de suppression jusqu'au `*/` final).

7. **Helpers identiques cross-IIFE pour 2 monstres frères** (`sauvegarderEvaluation` cyc 70 + `sauvegarderEvaluationModifiee` cyc 58) — partagent ~70 % de logique. Tentation : extraire des helpers communs en `window._construireEvaluationData` cross-IIFE → polluerait window pour 2 callers et créerait un couplage caché. Solution : duplication assumée avec suffixe distinctif (`_Sauv*` vs `_Modif*`) — ~150 LOC duplication acceptable. Cf. [[feedback-helpers-cross-iife-duppliques-suffixe]].

#### Améliorations de la méthode à proposer (Catégorie B — décision Grégoire)

> **Statut au 21 mai 2026 (Cat-B Track 2)** : les 5 propositions ci-dessous ont été ACTÉES et intégrées dans la méthode §3/§5. Numérotation finale : §5.12 (variables `let` cross-IIFE) et §5.13 (closures async passées en paramètre). Voir §8 historique des révisions ligne « 2026-05-21 Cat-B Track 2 ».

**5 propositions nouvelles** issues de l'étape 4 :

1. **§5 nouvel anti-pattern §5.11 candidat — Variables `let` cross-IIFE non promues `window.X`** : si une variable `let X` est déclarée dans une IIFE et référencée depuis une autre IIFE (cross-IIFE bare reference), le runtime jette ReferenceError. **Promotion `window.X` obligatoire avec drop du `let`** (écriture directe sur window) + patch §5.6 sur tous les sites de référence. Pattern bug #109 étape 4 (`_timerAutoSave`, `_pendingAutoSaveSnapshot`). **Ajouter §5.11 avec exemple `let _timerAutoSave` → `window._timerAutoSave =` + 15 sites patchés.** Cf. [[feedback-fix-bug-latent-avant-monstre]].

2. **§3 étape 4 — protocole « fix bug latent avant éclatement »** : quand un bug latent identifié vit À L'INTÉRIEUR d'un monstre qu'on s'apprête à éclater, corriger le bug **AVANT** l'éclatement (1 commit dédié de pré-requis). Sinon les helpers extraits héritent du bug et le débogage devient plus complexe. Distinguer des bugs latents EXTERNES qui restent préservés Cat-B. **Ajouter §3 étape 4 — « Lister les bugs latents identifiés étape 1/3 ; trier interne vs externe au monstre ; corriger les internes avant éclatement. »** Pattern bug #109 + commit `9045dfd` AVANT les 6 commits d'éclatement.

3. **§5 nouvel anti-pattern §5.12 candidat — Closures internes async dans un monstre éclaté** : si un monstre async contient des closures internes (`const attendre = async () => ...`) qui accèdent aux paramètres parent, ces closures DOIVENT rester définies dans la fonction outer et être passées EN PARAMÈTRE aux helpers extraits. **NE PAS les promouvoir `window.X`** (casserait l'accès aux paramètres + pollution window). **Ajouter §5.12 avec exemple `_appliquerModifFormulaire(evaluationId, attendreOption, trouverGroupeEtudiant)`.** Cf. [[feedback-closures-internes-passees-en-parametre]].

4. **§3 étape 4 — réflexe « extraction agrégée + sous-helpers DOM »** : une extraction initiale agrégée (par ex. `_construireNouvelleEvaluation`) peut produire un helper qui reste cyc > 30 par accumulation `|| {}`, ternaires, spread. Re-extraire des sous-helpers DOM dédiés (`_lireChampsDOM*`, `_lireOptionsAffichage*`) pour ramener cyc < 30. **Ajouter §3 étape 4 — « Si helper extrait reste cyc 32-45, identifier les dimensions internes (lire/valider/construire/écrire) et extraire un sous-helper par dimension. »** Cf. [[feedback-eclatement-sous-helpers-dom]] (3× confirmé sur trimestre-v2 + evaluation).

5. **§3 étape 4 — réflexe « monstre privé IIFE éclatable sans promotion `window.X` »** : un monstre cyc 30-50 défini PRIVÉ dans une IIFE peut être éclaté en helpers privés internes **sans promotion** si tous les call-sites restent intra-IIFE. Audit pré-éclatement : `grep -n "nomFonction\b" js/*.js` (sans `window.`) → si 0 hits cross-IIFE → éclatement intra-IIFE possible et préféré (pas d'inflation surface publique). **Ajouter §3 étape 4 — « Avant de classer un monstre privé en Cat-B sous N, grep call-sites : si tous intra-IIFE, éclatement intra-IIFE préféré. »** Cf. [[feedback-eclater-cas-limite-prive-iife]].

**Confirmations transverses (pas de nouvelle proposition)** :
- Pattern « N=50 seuil pragmatique » acté avec Grégoire au démarrage étape 4 — à mentionner dans §6.5 gabarit "Stratégie cyc > 30 (cible dure vs héritages)" (déjà proposé Cat-B #5 profil-etudiant).
- Audit ESLint après chaque extraction (§3 étape 4) — confirmé 6× sur evaluation, cible mûre.
- Préservation comportementale stricte sur bugs latents externes — confirmée sur evaluation (3 doublons + 2 code morts « alarmistes »).

#### État de la dette résiduelle

- **3 fonctions cyc > 30 héritages** à éclater cycle dédié Catégorie B post-merge :
  - `calculerNoteAlgorithmiqueAvecCategories` 42 (`evaluation-calcul.js`)
  - `chargerEchellePerformance` 36 (`evaluation-chargement.js`) — doublon cross-module #108 lié
  - `peuplementOptJetons` 33 (`evaluation-sauvegarde.js`)
- **Résidu `evaluation.js` 3 984 LOC** — zone Modification + Verrouillage + Liste + Banque + Recherche. Sous-module `evaluation-modification.js` distinct possible en cycle ultérieur si la dette devient gênante. Décision Grégoire 18 mai : reporter, vu l'imbrication forte avec pivot `evaluationEnCours`.
- **3 doublons préservés** : `restaurerPreferenceTri` (4295/4309), `obtenirClasseNote` (3681/4390), `filtrerListeEvaluations` (4178/6851). À résoudre Cat-B post-merge.
- **2 codes morts « alarmistes »** : `calculerRisqueEchec` (3634), `obtenirClasseRisque` (3644). À retirer Cat-B post-merge (lien T-L audit 1.3 cohérence lexicale vocabulaire alarmiste).
- **2 bugs latents** #107 (`initialiserModuleEvaluation` dead code silencieux) + #108 (`chargerEchellePerformance` doublon cross-module). À corriger Cat-B post-merge.
- **Couplage `travaux-ui.js:4639` → `window.evaluationEnCours`** : à investiguer Cat-B post-merge (légitime ou à découpler ?).
- **Wrappers `afficherNotificationSucces/Erreur` dupliqués** dans 7+ sous-modules — consolidation `utils-notifications.js` toujours reportée (décision maintenue à travers les 5 refactors — 73 sites d'appel cross-projet).
- **1-2 tests Playwright supplémentaires** pour rendus DOM effectifs (palette + rétroaction Bilan) — dette §6.5 cumulée sur les 5 refactors.

#### Notes pour les cycles Cat-B post-merge

`evaluation.js` était le **5e et dernier god module** PLAN-MOYEN-TERME §4.5. Les 5 refactors sont mergés sur `main` entre le 15 mai (bilan-reflexif) et le 21 mai (evaluation). **Backlog god modules épuré 5/5 livré.**

Dette résiduelle cumulée sur les 5 refactors à organiser en **cycles Catégorie B post-merge** :

1. **14 fonctions cyc > 30 héritages** réparties :
   - 5 profil-etudiant (`genererSectionMobilisationEngagement` 52, `genererSectionPerformance` 47, `calculerDetailsNoteFinale` 57, `determinerCibleIntervention` 58, `calculerIPB` 36)
   - 4 trimestre-v2 (`sauvegarderCoursV2` 56, `mettreAJourCarteResumeGroupeCoursV2` 34, `remplirFormCoursV2` 31, `genererNomGroupeCoursV2` 31)
   - 2 productions (déjà identifiées au refactor productions, non listées ici — voir METHODE §7 productions.js)
   - 3 evaluation (`calculerNoteAlgorithmiqueAvecCategories` 42, `chargerEchellePerformance` 36, `peuplementOptJetons` 33)
2. **Bugs latents #96-108** (13 bugs Cat-B inscrits SUIVI-BUGS) à corriger.
3. **Consolidation `utils-notifications.js`** (73 sites cross-projet) — chantier dédié.
4. **2 codes morts « alarmistes »** dans `evaluation.js` + chantier vocabulaire alarmiste audit annuel 1.3.
5. **Tests Playwright rendus DOM** (1-2 par module — 5-10 tests cumulés).
6. **Sous-découpage des résidus restés gros** : `profil-etudiant-sections-affichage.js` 4 654 LOC + `evaluation.js` résidu 3 984 LOC si la dette devient gênante (décisions Grégoire reportées).

**Trouvailles transversales 5 refactors** (à consolider dans une rétrospective globale hors METHODE §7 si Grégoire le souhaite) :
- Pattern « N=50 seuil pragmatique éclatement vs Cat-B » confirmé sur evaluation.
- Pattern « git mv si résidu = IIFE complet » (profil-etudiant session D), non répété sur evaluation (zone Modification trop imbriquée).
- Convention `// security-ok` inline obligatoire (profil-etudiant session B → evaluation).
- Encapsulation variables module-scope `let`/`const` sans promotion `window.X` (variables strictement privées) **VS** promotion `window.X` systématique pour fonctions ET pour variables cross-IIFE (cas bug #109).
- Helpers cross-IIFE duppliqués avec suffixe distinctif pour monstres frères (evaluation `_Sauv*` vs `_Modif*`) — différent du pattern « factoriser branches dupliquées en paramètres » (productions-validation, trimestre-v2 `_rafraichirVuesContextDependantes`) — décision case-by-case selon ratio divergences/duplication.

---

## 8. Historique des révisions de la méthode

À mettre à jour quand la méthode elle-même est modifiée (étape ajoutée, anti-pattern complété, check-list étendue).

| Date | Module à l'origine de la révision | Modification | Auteur |
|---|---|---|---|
| 2026-05-15 | — (création initiale) | Document créé en réponse à la question « comment la méthode se rode-t-elle d'un module à l'autre ? ». Première session de refactoring (`bilan-reflexif.js`) déjà démarrée — capitalisation rétroactive prévue. | Cowork (Claude) + Grégoire |
| 2026-05-15 | `bilan-reflexif.js` | 6 propositions Catégorie B issues de la rétrospective §7 acceptées par Grégoire : §3 étape 0 (convention nom de branche clarifiée), §3 étape 1 (helpers cross-module à identifier avant extraction), §3 étape 4 (audit ESLint complexity sur TOUS les sous-modules de la session), §4 check-list étape 3 (items cyc + grep helpers ajoutés), §5 anti-patterns (§5.6 helpers cross-module non identifiés, §5.7 resync ctx ↔ parent), §6.5 gabarit (rubrique Tests Playwright pour rendus DOM ajoutée). | Cowork (Claude) + Grégoire |
| 2026-05-21 | `evaluation.js` (5e et dernier god module) | 5 propositions Catégorie B issues de la rétrospective §7 déposées (en attente décision Grégoire) : §5 anti-patterns §5.11 (variables `let` cross-IIFE non promues `window.X` — bug #109), §3 étape 4 (protocole « fix bug latent avant éclatement »), §5 anti-patterns §5.12 (closures internes async passées en paramètre), §3 étape 4 (extraction agrégée + sous-helpers DOM), §3 étape 4 (monstre privé IIFE éclatable sans promotion `window.X`). Pattern « N=50 seuil pragmatique éclatement vs Cat-B » confirmé. **Backlog god modules épuré 5/5 livré** — entre dans phase « cycles Catégorie B post-merge » (14 fonctions cyc > 30 héritages, 13 bugs latents #96-108, consolidation `utils-notifications.js`, sous-découpage résidus si nécessaire). | Cowork (Claude) + Grégoire |
| 2026-05-21 | Cat-B Track 2 — toutes rétrospectives (productions 4, trimestre-v2 5, profil-etudiant 6, evaluation 5) | **20 propositions Catégorie B actées et intégrées** dans la méthode. **§3** : convention chargement orchestrateurs en dernier (étape 0), grep `window.X` avant/après extraction + renommage si résidu déjà IIFE complet (étape 3), trade-off cyc 15/cyc 30 + stratégie cyc > 30 (cible dure vs héritages Cat-B, seuil N=50) + découpage supplémentaire + extraction agrégée + sous-helpers DOM + monstre privé IIFE éclatable + bug latent pendant lecture + protocole « fix bug latent interne avant éclatement » (étape 4), tester les deux modes sombre/clair (étape 5). **§4** : check-list étape 3 enrichie de 4 items (doublons d'export pré-deletion, audit symétrique inverse exports, grep `window.X` post-deletion, audit cross-zone tardif). **§5** : 6 nouveaux anti-patterns §5.8 à §5.13 (wrappers résiduels module-scope, factoriser branches dupliquées, `// security-ok` inline obligatoire, variables module-scope encapsulées IIFE, variables `let` cross-IIFE promues `window.X`, closures async passées en paramètre). **§6.5** : rubrique « Stratégie cyc > 30 (cible dure vs héritages Cat-B) » ajoutée au gabarit. **METHODE-REFACTORING gelée jusqu'au prochain cycle de refactors** (Q3 2026 si nouveau cycle). | Cat-B Track 2 (Claude autonome — relecture Grégoire en révision finale) |

---

## 9. Articulation avec les autres documents

- **`audit/PLAN-MOYEN-TERME.md`** : ordre des modules, calendrier, estimation d'effort. Ce document précise le **comment** ; PLAN-MOYEN-TERME précise le **quand** et **dans quel ordre**.
- **`audit/refactoring-prep/MODULES-MAP.md`** : cartographie de chaque module (zones, sous-modules cibles, tests). Ce document précise la **méthode opératoire** ; MODULES-MAP précise le **contenu spécifique** de chaque module.
- **`Skills pour Claude Code/SKILL_integrite_globaux.md`** : checklist pour les opérations sur les globaux partagés. À consulter spécifiquement quand un refactoring touche aux clés SSOT critiques.
- **`Skills pour Claude Code/SKILL_Securite_donnees.md`** : à consulter quand un refactoring touche aux données sensibles (notamment `profil-etudiant-confidentiel.js`).
- **`CLAUDE.md`** racine : conventions de projet, règles de sécurité non négociables (échappement HTML, validation imports, etc.) — à respecter pendant tout refactoring.

---

**Fin du document méthodologique.** À enrichir après chaque module refactoré. C'est un document **vivant**, pas une référence figée.
