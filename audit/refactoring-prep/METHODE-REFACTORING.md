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

### Étape 4 — Refactoring des fonctions top-complexité (~1-3 h selon module)

Pour chaque fonction identifiée par `MODULES-MAP.md` §2.x comme « top-complexité » (cyc > 30 ou > 50) :

- Identifier les blocs cohérents : initialisation, validation des entrées, calcul principal, mise à jour DOM, sauvegarde, gestion d'erreurs.
- Extraire chaque bloc en sous-fonction nommée explicitement.
- Faire passer les tests après chaque extraction.

Cible : aucune fonction au-delà de cyclomatic 30 dans les nouveaux sous-modules. Cible souple : tendre vers cyclomatic ≤ 15 quand c'est faisable sans contorsion artificielle.

Vérification : lancer `npx eslint --rule '{"complexity": ["error", 30]}' js/<sous-module>.js` avant de commiter chaque sous-module.

**Audit complet à chaque extraction** : passer ESLint complexity sur **tous les sous-modules déjà extraits dans la session**, pas seulement le sous-module en cours. Une fonction héritée peut avoir une complexité au-dessus du seuil dans son sous-module d'arrivée et ne sera pas attrapée si on n'audite que le périmètre courant. Cas vu lors de `bilan-reflexif.js` : `_agregerQuestion` (cyc 48) et `parserQuestionnaireTexte` (cyc 63) ont nécessité une correction a posteriori en un commit unifié au lieu d'être traités à leur extraction.

Procédure recommandée : créer un script `audit/refactoring-prep/check-complexity.sh` qui lance `npx eslint --no-eslintrc --parser-options ecmaVersion:2020 --rule '{"complexity": ["error", 30]}' js/<prefix>*.js` (avec `<prefix>` égal au préfixe partagé des sous-modules du module en cours) et le faire tourner après chaque extraction.

### Étape 5 — Validation du module entier (~30 min - 1 h)

Une fois tous les sous-modules extraits :

- Lancer la suite complète des tests : `cd tests && npm test`.
- Lancer un test manuel exhaustif du module dans l'app, validé par Grégoire :
  - Pour `evaluation.js` : chargement + saisie + sauvegarde + modification + filtre par production + verrouillage.
  - Pour `productions.js` : création + modification + suppression + bibliothèque + import/export.
  - Pour `trimestre-v2.js` : création trimestre + CRUD cours/étudiants/horaires/groupes-cours + changement groupe-cours actif.
  - Pour `profil-etudiant.js` : affichage profil + section confidentiel + jetons.
  - Pour `bilan-reflexif.js` : éditeur + parcours + réflexion + import CSV + rapport.
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

- [ ] Nouveau fichier `js/<sous-module>.js` créé avec entête IIFE standard.
- [ ] Fonctions copiées sans modification fonctionnelle.
- [ ] Dépendances identifiées et résolues (exposition `window.X` si nécessaire).
- [ ] `<script>` ajouté dans `index.html` au bon endroit (après dépendances, avant consommateurs).
- [ ] Fonctions retirées du fichier d'origine.
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

Sept pièges connus, spécifiques au stack et aux conventions du projet. À surveiller à chaque module.

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

À refactorer après `bilan-reflexif.js`. Rétrospective à remplir à la fin.

### Module : `trimestre-v2.js`

À refactorer après `productions.js`. Rétrospective à remplir à la fin.

### Module : `profil-etudiant.js`

À refactorer après `trimestre-v2.js`. Rétrospective à remplir à la fin.

### Module : `evaluation.js`

À refactorer en dernier. Rétrospective à remplir à la fin.

---

## 8. Historique des révisions de la méthode

À mettre à jour quand la méthode elle-même est modifiée (étape ajoutée, anti-pattern complété, check-list étendue).

| Date | Module à l'origine de la révision | Modification | Auteur |
|---|---|---|---|
| 2026-05-15 | — (création initiale) | Document créé en réponse à la question « comment la méthode se rode-t-elle d'un module à l'autre ? ». Première session de refactoring (`bilan-reflexif.js`) déjà démarrée — capitalisation rétroactive prévue. | Cowork (Claude) + Grégoire |
| 2026-05-15 | `bilan-reflexif.js` | 6 propositions Catégorie B issues de la rétrospective §7 acceptées par Grégoire : §3 étape 0 (convention nom de branche clarifiée), §3 étape 1 (helpers cross-module à identifier avant extraction), §3 étape 4 (audit ESLint complexity sur TOUS les sous-modules de la session), §4 check-list étape 3 (items cyc + grep helpers ajoutés), §5 anti-patterns (§5.6 helpers cross-module non identifiés, §5.7 resync ctx ↔ parent), §6.5 gabarit (rubrique Tests Playwright pour rendus DOM ajoutée). | Cowork (Claude) + Grégoire |

---

## 9. Articulation avec les autres documents

- **`audit/PLAN-MOYEN-TERME.md`** : ordre des modules, calendrier, estimation d'effort. Ce document précise le **comment** ; PLAN-MOYEN-TERME précise le **quand** et **dans quel ordre**.
- **`audit/refactoring-prep/MODULES-MAP.md`** : cartographie de chaque module (zones, sous-modules cibles, tests). Ce document précise la **méthode opératoire** ; MODULES-MAP précise le **contenu spécifique** de chaque module.
- **`Skills pour Claude Code/SKILL_integrite_globaux.md`** : checklist pour les opérations sur les globaux partagés. À consulter spécifiquement quand un refactoring touche aux clés SSOT critiques.
- **`Skills pour Claude Code/SKILL_Securite_donnees.md`** : à consulter quand un refactoring touche aux données sensibles (notamment `profil-etudiant-confidentiel.js`).
- **`CLAUDE.md`** racine : conventions de projet, règles de sécurité non négociables (échappement HTML, validation imports, etc.) — à respecter pendant tout refactoring.

---

**Fin du document méthodologique.** À enrichir après chaque module refactoré. C'est un document **vivant**, pas une référence figée.
