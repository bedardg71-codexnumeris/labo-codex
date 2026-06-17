# Plan de cours — Comprendre les coulisses du développement de Labo Codex

> **Statut** : première ébauche (17 juin 2026), à raffiner ensemble.
> **Pour qui** : Grégoire — enseignant, concepteur de Labo Codex, **non-codeur**.
> **Pourquoi** : pendant nos sessions, beaucoup de concepts, de termes et d'outils
> défilent sans que tu aies le temps de les comprendre. Ce document sert de **syllabus**
> pour une (ou plusieurs) session(s) entièrement consacrée(s) à l'explication, à ton
> rythme, en partant de ce qu'on a réellement fait.
>
> **Principe pédagogique** : on part du **concret vécu** (les tâches de la session du
> 17 juin) pour remonter vers les **concepts** — exactement la logique « expérience →
> abstraction » que tu utilises avec tes élèves. Chaque module est ancré dans un
> moment réel de notre travail.

---

## 1. Intentions d'apprentissage (ce que tu sauras faire après le cours)

Au terme du cours, tu pourras :

1. **Lire et comprendre** ce que j'écris quand je décris mon travail (commits, rapports
   de session, messages de PR) — sans te sentir largué par le vocabulaire.
2. **Suivre une décision** de bout en bout : d'un retour terrain que tu m'écris jusqu'à
   la mise en ligne sur `app.codexnumeris.org`.
3. **Juger la solidité** d'un changement : comprendre ce qu'est un test, pourquoi un
   test « qui passe » ne suffit pas, et ce qu'est la « vérification adverse ».
4. **Dialoguer plus précisément** avec moi : poser de meilleures questions, repérer
   quand quelque chose mérite ton attention (déploiement, perte de données, sécurité).
5. **Te repérer** dans la structure du projet (les dossiers, les fichiers, les versions).

> Ce n'est PAS un cours pour devenir programmeur. C'est un cours pour devenir un
> **commanditaire éclairé** de ton propre logiciel.

---

## 2. Inventaire de la session du 17 juin (notre matériau de base)

Voici, en langage simple, ce qu'on a réellement fait aujourd'hui. Chaque ligne deviendra
un exemple concret dans un module du cours.

| # | Ce qu'on a fait | En une phrase simple |
|---|------------------|----------------------|
| T1 | Livré le « banc de décision » (comparateur de pratiques) | Un nouvel écran pour comparer des façons de noter. |
| T2 | Corrigé « les notes affichent 0 » en mode fictif | Une donnée (le % d'un niveau d'échelle) portait 3 noms différents ; le code n'en lisait qu'un. |
| T3 | Rendu les « maquettes » trouvables et supprimables | Tu ne trouvais pas tes essais pour les jeter → on a ajouté un panneau qui pointe au bon endroit. |
| T4 | Ajouté un lien vers le comparateur depuis le formulaire | Un raccourci dans la page de création d'une pratique. |
| T5 | Ajouté une note « Outil en développement » | Un avertissement honnête dans l'écran du comparateur. |
| T6 | Écrit des « tests » pour protéger ces changements | Du code qui vérifie automatiquement que ça marche. |
| T7 | Publié le travail (commit → PR → CI → déploiement) | Le circuit pour faire passer le code de mon brouillon à ta prod. |
| T8 | Documenté la session et préparé le relais | Le « cahier de bord » pour la prochaine session. |

**Un moment clé à retenir** : pour T3, j'avais d'abord écrit du code « au cas où »…
puis je l'ai **retiré** après avoir vérifié qu'il ne servirait jamais. Ça illustre une
règle de ton projet (« zéro-dette ») et la posture de vérification. On y reviendra.

---

## 3. Glossaire de la session (les termes qui ont défilé)

Regroupés par famille. Définitions volontairement en langage courant — on les
approfondira en cours.

### 3.1 Le terrain : qu'est-ce qu'une « app » comme Labo Codex
- **Code source** : le texte d'instructions qui fait fonctionner l'app.
- **HTML / CSS / JavaScript** : le squelette (HTML), l'habillage visuel (CSS), le
  comportement (JavaScript).
- **Navigateur** : le logiciel (Safari, Chrome) qui lit ce code et affiche l'app.
- **Hors-ligne (offline)** : Labo Codex fonctionne sans Internet.
- **localStorage / IndexedDB** : les deux « tiroirs » où l'app range tes données
  **dans ton navigateur** (pas sur un serveur).
- **SSOT (Single Source of Truth)** : « source unique de vérité » — chaque donnée a
  **un seul** endroit officiel, pour éviter les contradictions.
- **Namespacing (préfixe)** : ranger les données par trimestre (`h2026_…`) pour ne pas
  mélanger les sessions.

### 3.2 Organiser le code
- **Fichier** (ex. `comparateur-pratiques.js`) : une « page » de code, par sujet.
- **Fonction** : une recette nommée qui fait une tâche précise (ex. `naviguerVers`).
- **Module** : un regroupement de fonctions sur un même thème.
- **Refactoring** : réécrire du code pour le rendre plus propre, sans changer ce qu'il fait.
- **Code mort** : du code qui n'est jamais utilisé (à supprimer — règle « zéro-dette »).

### 3.3 Le contrôle de version (Git / GitHub)
- **Git** : le « cahier de bord » qui enregistre chaque modification du code.
- **Commit** : une modification enregistrée, avec un message qui l'explique.
- **Branche** : une ligne de travail parallèle, pour ne pas toucher la version officielle.
- **`main`** : la branche **officielle** (celle qui part en production).
- **Push / Fetch / Pull** : envoyer / aller chercher / rapatrier des modifications.
- **PR (Pull Request)** : une demande de fusionner une branche dans `main`, avec résumé.
- **Merge / Squash** : fusionner ; « squash » = condenser tous les commits en un seul.
- **Auto-merge** : la PR fusionne **toute seule** quand les vérifications sont au vert.
- **HEAD, origin, fast-forward, reset, force-with-lease** : vocabulaire fin de Git —
  on le verra seulement si tu le souhaites (niveau avancé).

### 3.4 La qualité et la confiance
- **Test** : du code qui vérifie automatiquement qu'une partie de l'app marche.
- **Test unitaire (Vitest)** : vérifie une **petite** fonction isolée. Rapide.
- **Test d'intégration (Playwright)** : ouvre **vraiment** l'app dans un navigateur
  (WebKit = moteur de Safari) et vérifie le comportement à l'écran.
- **Sentinelle** : un test qui « monte la garde » sur un correctif pour qu'il ne casse
  pas plus tard.
- **CI (intégration continue)** : un robot (GitHub Actions) qui relance **tous** les
  tests à chaque PR, automatiquement.
- **Break-test / vérification adverse** : LE concept central de ton projet — avant de
  faire confiance à un test, on le fait **échouer exprès** pour prouver qu'il détecte
  vraiment le problème. « L'attestation n'est pas la preuve. »
- **Golden master** : un test qui fige un résultat de référence (ex. une note calculée)
  pour détecter toute dérive future.

### 3.5 La mise en ligne
- **Netlify** : le service qui héberge et publie Labo Codex.
- **Production (prod)** : la vraie app, celle que tu utilises (`app.codexnumeris.org`).
- **Deploy preview** : une version d'essai d'une PR, sur une adresse temporaire.
- **Version (SemVer)** : la numérotation `X.Y.Z` → **majeur.mineur.correctif**
  (ex. 1.19.2). On a bumpé un « correctif » aujourd'hui.
- **Build** : l'horodatage d'une fabrication précise (ex. `0617-1822`).

### 3.6 La sécurité (règles non négociables du projet)
- **CSP (Content Security Policy)** : une règle du navigateur qui interdit les scripts
  non prévus → protège contre l'injection de code.
- **`innerHTML`** : insérer du contenu dans la page ; dangereux avec des données
  utilisateur.
- **`echapperHtml()`** : neutraliser les caractères dangereux d'un texte utilisateur
  (nom d'élève, titre…) avant de l'afficher.
- **Handler inline vs `data-action`** : on n'écrit jamais le comportement directement
  dans le bouton (interdit par la CSP) ; on passe par un « aiguilleur » (`data-action`).

### 3.7 Les concepts propres à Labo Codex touchés aujourd'hui
- **Pratique de notation** : une façon de calculer la note. 4 familles :
  **SOM** (sommative), **STD** (PAN-Standards), **SPE** (spécifications),
  **DEN** (dénotation / jugement).
- **Maquette** : un **essai** de pratique, rangé dans le Labo, masqué de la bibliothèque
  tant qu'il n'est pas « adopté ». Verbes : **dériver / adopter / jeter**.
- **Banc de décision (comparateur)** : l'écran qui met 2-3 pratiques côte à côte sur des
  profils d'élèves pour aider à **choisir** une pratique.
- **Profils-types fictifs** : des élèves imaginaires générés à partir de **ton échelle**,
  pour faire tourner la comparaison avant d'avoir de vraies données.
- **Simulation / injection mémoire** : calculer une note « pour voir », en **lecture
  seule**, sans rien modifier de tes vraies données.
- **« Note non constructible »** : quand les paramètres d'une pratique et les résultats
  réels ne permettent pas de calculer une note (ce qu'on a recadré aujourd'hui).

---

## 4. Inventaire des outils utilisés

| Outil | À quoi il sert | Quand on l'a utilisé aujourd'hui |
|-------|----------------|----------------------------------|
| **Git** | Cahier de bord du code | Chaque commit de la session |
| **GitHub** | Héberge le code + PR + robots de tests | PR #51, vérification de la CI |
| **GitHub Actions (CI)** | Relance les tests automatiquement | Vitest + Playwright + CodeQL sur la PR |
| **Vitest** | Lance les tests unitaires | 847 tests verts |
| **Playwright (WebKit)** | Lance les tests dans un vrai navigateur | Sentinelle des maquettes |
| **Node.js / npm** | Faire tourner les outils (tests, scripts) | `npm run test:unit` |
| **CodeQL** | Robot d'analyse de sécurité du code | Vérification automatique sur la PR |
| **Netlify** | Héberge et publie l'app | Deploy preview + prod |
| **`scripts/release.mjs`** | Calcule et synchronise le numéro de version | Bump en 1.19.2 |
| **Claude Code** (moi) | Lire, écrire, tester, documenter le code | Toute la session |

---

## 5. Plan de cours proposé (modules)

Progression du plus concret au plus abstrait. Chaque module : **objectif**, **ancrage**
dans la session, **durée estimée**. À ajuster selon ton intérêt — on peut zoomer sur
certains et survoler d'autres.

### Module 0 — Carte du territoire (30 min)
- **Objectif** : avoir une vue d'ensemble « de ton idée à ta prod ».
- **Ancrage** : on suit le voyage de T3 (« je ne peux pas supprimer mes maquettes »)
  jusqu'à `app.codexnumeris.org`.
- **Question-fil** : « Que se passe-t-il entre le moment où je t'écris un bug et le
  moment où c'est corrigé chez moi ? »

### Module 1 — Qu'est-ce que Labo Codex, techniquement (45 min)
- **Objectif** : comprendre HTML/CSS/JS, navigateur, hors-ligne, et où vivent tes données.
- **Ancrage** : localStorage/IndexedDB → là où sont tes vrais trimestres ; pourquoi le
  « namespacing » `h2026_…` existe (cf. le bug #340 que tu as déjà vécu).
- **Concepts** : 3.1 + 3.2 du glossaire.

### Module 2 — Le contrôle de version (Git/GitHub) (45 min)
- **Objectif** : comprendre commit / branche / `main` / PR / merge.
- **Ancrage** : nos 3 commits du jour ; la PR #51 ; pourquoi on travaille sur une
  **branche** et pas directement sur `main`.
- **Concepts** : 3.3. (Le vocabulaire avancé — reset, force-with-lease — est optionnel.)

### Module 3 — La qualité : tests et CI (60 min)
- **Objectif** : comprendre ce qu'est un test, la différence unitaire/intégration, et
  pourquoi la CI existe.
- **Ancrage** : la sentinelle des maquettes ; les 847 tests verts ; pourquoi je ne
  pouvais PAS lancer Playwright en cloud (et la CI s'en charge).
- **Concepts** : 3.4 (partie tests + CI).

### Module 4 — Le cœur : la vérification adverse (45 min) ⭐
- **Objectif** : comprendre pourquoi « un test qui passe » ne suffit pas, et ce qu'est
  le **break-test**.
- **Ancrage** : aujourd'hui, j'ai fait **échouer exprès** le test des maquettes (en
  retirant le flag `estMaquette`) pour prouver qu'il détecte vraiment le problème.
- **Pont pédagogique** : c'est **exactement** ta posture d'évaluateur — une preuve doit
  pouvoir être réfutée. Ce module te parlera particulièrement.

### Module 5 — La mise en ligne et les versions (30 min)
- **Objectif** : comprendre Netlify, prod vs preview, et la numérotation des versions.
- **Ancrage** : pourquoi tu voyais encore 1.19.1 ce matin (pas encore déployé) ;
  ce que veut dire « correctif » dans 1.19.**2**.
- **Concepts** : 3.5.

### Module 6 — La sécurité (règles non négociables) (45 min)
- **Objectif** : comprendre CSP, échappement HTML, et pourquoi on bannit certaines
  façons d'écrire.
- **Ancrage** : pourquoi nos nouveaux boutons utilisent `data-action` et jamais un
  `onclick=` direct ; l'audit de sécurité que j'ai fait sur le diff aujourd'hui.
- **Concepts** : 3.6.

### Module 7 — Le vocabulaire propre à Labo Codex (45 min)
- **Objectif** : aligner le vocabulaire métier (que TU as conçu) avec sa traduction en
  code.
- **Ancrage** : SOM/STD/SPE/DEN, maquette, banc de décision, simulation, « note non
  constructible ».
- **Concepts** : 3.7. (Recoupe tes propres skills `SKILL_pratiques_notation`, etc.)

### Module 8 (optionnel, avancé) — Comment JE travaille (30 min)
- **Objectif** : démystifier ce que fait « Claude Code » : lire, chercher, éditer,
  tester, et les garde-fous (rituels de début/fin de session, posture adverse).
- **Ancrage** : le rituel de fin de session qu'on vient de dérouler.

---

## 6. Format pédagogique suggéré

- **Une session = un ou deux modules**, jamais plus (densité maîtrisée).
- **Toujours partir d'un exemple réel** de nos sessions (le « cahier de bord » SESSION.md
  est une mine d'exemples).
- **Pas de code à écrire de ta part** : tu observes, tu questionnes, je montre.
- **Un mini-glossaire vivant** : on enrichit la section 3 de ce document au fil des
  séances, avec TES reformulations (celles qui font sens pour toi font foi).
- **Vérification de compréhension** à la fin de chaque module : tu me réexpliques le
  concept dans **tes** mots (le meilleur test, tu le sais).

---

## 7. À compléter ensemble (questions ouvertes pour la prochaine fois)

- [ ] Quels modules te paraissent **prioritaires** ? (mon pari : Module 4 + Module 1)
- [ ] Préfères-tu un cours **linéaire** (0→8) ou **à la carte** (selon ce qui surgit) ?
- [ ] Veux-tu qu'on **glisse des analogies pédagogiques** systématiques (ta zone de
      confort) pour chaque concept technique ?
- [ ] Y a-t-il des termes hors de cette session que tu veux **aussi** voir (ex. « API »,
      « serveur », « base de données », « chiffrement ») ?
- [ ] Garde-t-on ce document comme **manuel de cours évolutif** (on l'enrichit à chaque
      séance) ?

---

## Annexe A — Trois mots expliqués (CI, PR, Monitor)

> Demandés par Grégoire le 17 juin. Première rédaction « en clair », à raffiner
> ensemble. Chacun est ancré dans ce qui s'est **réellement** passé aujourd'hui sur
> la PR #51.

### A.1 — PR (Pull Request, « demande de fusion »)
**En une phrase** : une PR est une **proposition formelle** de faire entrer une série de
modifications dans la version officielle de l'app (`main`), accompagnée d'un résumé du
*pourquoi*, de vérifications automatiques, et d'un espace de discussion.

**Pourquoi ça existe** : on ne modifie **jamais** directement la version officielle. On
travaille à côté, sur une *branche*, puis on **demande** de fusionner. Ça laisse une
trace, ça force un résumé, et ça permet aux vérifications de tourner avant que quoi que
ce soit n'atteigne ta prod.

**Analogie enseignante** : c'est comme soumettre un **plan de cours** à l'approbation
avant qu'il n'entre dans le programme officiel — avec une justification jointe et une
liste de contrôle qui doit être au vert.

**Aujourd'hui** : la **PR #51** transporte tout notre travail 1.19.2 (suppression des
maquettes, lien comparateur, note « en développement »).

### A.2 — CI (Intégration continue)
**En une phrase** : la CI est un **robot** qui, à **chaque** proposition de changement,
relance **automatiquement TOUS les tests** sur une machine neutre — et qui **bloque** la
fusion tant que tout n'est pas vert.

**Pourquoi ça existe** : pour que « ça marche sur ma machine » ne suffise jamais. Le
robot rejoue les tests dans les mêmes conditions, à chaque fois, sans oubli ni fatigue.

**Analogie enseignante** : c'est un **examen standardisé** que **chaque** nouvelle version
de l'app doit **repasser** avant d'avoir le droit de « passer en prod ». Tant que
l'examen n'est pas réussi, la version reste en salle d'attente.

**Aujourd'hui** : la CI a fait **exactement son travail**. Elle a relancé les tests dans
un **vrai navigateur** (un test que je ne peux PAS lancer ici, en nuage), et elle a
**attrapé une erreur** — pas dans la fonctionnalité livrée, mais dans **mes données de
test** (j'avais fabriqué des pratiques bidon trop incomplètes). Sans la CI, ce défaut
serait passé inaperçu. J'ai corrigé, et le robot revalide.

> Détail utile : la CI de ce projet enchaîne trois robots — **Vitest** (tests rapides de
> petites fonctions), **Playwright/WebKit** (ouvre vraiment l'app comme Safari), et
> **CodeQL** (analyse de sécurité du code).

### A.3 — Monitor (surveillant de session)
**En une phrase** : le Monitor n'est **pas** un concept de Git/GitHub — c'est un petit
**outil que MOI j'utilise** pendant notre session pour **surveiller** quelque chose de
long sans avoir à vérifier sans arrêt.

**Pourquoi ça existe** : certaines choses prennent du temps (ex. « la PR #51 va-t-elle
fusionner ? »). Plutôt que de re-regarder toutes les minutes, j'arme un veilleur qui me
**prévient au bon moment**.

**Analogie enseignante** : c'est une **minuterie de four** — tu la règles, tu fais autre
chose, et elle sonne quand c'est prêt. Tu n'as pas à fixer le four.

**Aujourd'hui** : mon Monitor guette le moment où ta prod passera en 1.19.2 ; dès que
c'est déployé, il me « sonne » et je te le confirme.

### A.4 — Comment les trois s'articulent (le circuit complet)
1. Je travaille sur une **branche** (à côté de l'officiel).
2. J'ouvre une **PR** (je propose la fusion + je résume le pourquoi).
3. La **CI** (le robot-examen) relance tous les tests sur la PR.
4. Si tout est **vert** → la PR **fusionne** dans `main` → l'hébergeur (**Netlify**)
   **déploie** la nouvelle version sur ta prod.
5. Mon **Monitor** me prévient du déploiement → je te confirme que c'est en ligne.

> **À retenir** : PR et CI sont des objets **permanents** de GitHub (ils font partie du
> projet et restent visibles). Le Monitor est une **commodité de session** : il
> n'existe que le temps de notre conversation.

---

## Annexe B — Quelle forme donner à ce « cours » ? (proposition)

Tu as posé la question : un simple échange ? un document HTML ? Voici les options, leurs
forces et faiblesses, et ma recommandation.

| Forme | Forces | Limites |
|-------|--------|---------|
| **Échange en direct** (conversation) | Souple, à la demande, on suit ta curiosité | **Éphémère** : rien ne reste, on se répète |
| **Document Markdown vivant** (ce fichier) | Persistant, versionné, simple à enrichir à chaque séance | Présentation austère (texte brut), pas interactif |
| **Page HTML autonome** (comme `design-system.html`) | Belle lecture, sommaire cliquable, schémas, sections repliables ; ouvrable hors-ligne | Plus longue à construire et à tenir à jour |

**Ma recommandation — une approche hybride, en deux temps** :

1. **Maintenant** : garder **ce Markdown** comme **manuel source** (la « source unique de
   vérité » du cours), enrichi à chaque séance, + nos **échanges en direct** pour
   l'explication vivante. C'est léger, ça démarre tout de suite, ça ne se perd pas.
2. **Plus tard, une fois le plan stabilisé** : générer une **page HTML de cours**
   agréable (sommaire, analogies encadrées, schéma du circuit PR→CI→déploiement,
   sections repliables) qui vivra à côté de `design-system.html`. On ne la construit
   qu'une fois le **contenu** validé — sinon on maintient deux versions pour rien.

> C'est **exactement la philosophie de ton projet** : le Markdown = le contenu (SSOT) ;
> le HTML = la présentation, dérivée du contenu quand il est prêt. Tu retrouveras ce
> principe dans le Module 1 du cours.

**Décision pour toi (prochaine séance)** :
- [ ] On valide l'approche hybride (Markdown maintenant → HTML plus tard) ?
- [ ] Ou tu préfères qu'on saute directement à une **page HTML** dès le départ ?

---

*Première ébauche montée le 17 juin 2026 pendant l'attente de la CI/PR #51 ; enrichie le
même soir (Annexes A et B) en autonomie, à la demande de Grégoire. À discuter,
réorganiser et enrichir ensemble.*
