---
name: fin-de-session-labo-codex
description: >
  Workflow exécutable de fin de session pour Labo Codex. Déclencher dès que
  Grégoire dit «rituel de fin de session», «applique le rituel», «avant qu'on
  commit», «j'ai fini pour aujourd'hui», «vérifie avant de pousser», ou toute
  formulation signalant la clôture d'une session de travail. Audit du code
  modifié contre les règles non négociables de CLAUDE.md (section sécurité)
  et le skill `securite-donnees` §9, exécution de la suite de tests, vérification
  adverse des tests neufs/modifiés (break-test : le test doit pouvoir échouer) et
  confrontation des affirmations de session au diff réel, bump de version par
  `scripts/release.mjs` si nécessaire. Rapport sans modification automatique —
  toute correction reste à la décision de Grégoire.
  Prérequis : le skill `securite-donnees` pour le contexte des règles vérifiées ;
  le skill `verification-adverse` pour le « pourquoi » et la procédure du break-test (§4).
---

# SKILL : Rituel de fin de session — Labo Codex

> Cette skill est une procédure exécutable, pas une référence. Elle automatise
> ce qu'un développeur consciencieux ferait avant chaque commit, en s'appuyant
> sur les règles déjà documentées (CLAUDE.md section sécurité, le skill `securite-donnees` §9).
> Elle est en lecture seule : aucune modification de fichier, aucun commit, aucun push.

---

## 0. QUAND DÉCLENCHER

- Fin de séance de travail
- Avant tout `git commit`
- Avant tout `git push`
- À la demande explicite de Grégoire

Ne PAS déclencher pendant un debug en cours (utiliser le skill `debug-labo-codex`),
pendant une exploration de code, ou pendant la planification d'une fonctionnalité.

---

## 1. INVENTAIRE DES CHANGEMENTS

**Objectif** : identifier exactement ce qui a bougé depuis le dernier commit.

```bash
git status --porcelain
git diff --name-only HEAD
```

Produire une liste claire :
- Fichiers modifiés (M)
- Fichiers ajoutés (A)
- Fichiers supprimés (D)
- Fichiers non suivis (??)

Catégoriser par dossier pour situer le périmètre :
- `js/` — code applicatif (audit obligatoire §2)
- `tests/` — suite de tests (signalement, pas d'audit §2)
- `docs/`, `Retours des testeurs/` — documentation
- `index.html`, `styles.css` — interface (audit §2 sur index.html, vérification CSP §2.6)
- racine — fichiers de config (version : bump via `release.mjs` au §5)

⏸ Rapporter à Grégoire le périmètre détecté. S'il dit «ce n'est pas ce que je
veux vérifier», ajuster avant de passer à l'étape 2.

---

## 2. AUDIT SÉCURITÉ STATIQUE

**Objectif** : sur chaque fichier JS et HTML modifié, chercher les motifs
interdits par CLAUDE.md (section « Regles de securite ») et
le skill `securite-donnees` §9. Signaler sans corriger.

> Les règles vérifiées ci-dessous sont définies dans CLAUDE.md — s'y référer
> pour l'énoncé canonique et les exemples conformes. Ce qui suit est la
> traduction en motifs à grepper, pas une redéfinition.

### 2.1 innerHTML non échappé

Motif : `innerHTML\s*[+]?=` injectant des données utilisateur sans
`echapperHtml()`. Exceptions (ne pas signaler) : `innerHTML = ''`, chaînes
100 % statiques, contenu déjà échappé plus haut dans la fonction.

### 2.2 Handlers inline

Motif : `on\w+=` dans une chaîne injectée via innerHTML ou un attribut HTML.
Pattern correct : `data-action` / `data-on-change` routés par le dispatcher
de `main.js` (handler `[data-action]`, ≈ lignes 781-836).

### 2.3 Évaluations dynamiques

Motifs : `eval(`, `new Function(`, `setTimeout('` / `setInterval('` (chaîne
au lieu de fonction). Tolérance zéro — signaler comme **bloquant**.

### 2.4 console.log

Motif : `console\.log\(` dans le code de production.

Périmètre : tous les fichiers de `js/`, plus `index.html`. Exclure : `tests/`,
`scripts/`, et tout fichier d'utilitaire de développement.

Le code nouveau doit utiliser `console.warn` ou `console.error`. Signaler
chaque occurrence avec fichier et ligne.

### 2.5 Imports sans validation

Recherche dans les fichiers modifiés :

- Tout nouvel appel à `JSZip` ou import d'archive ZIP doit être précédé
  d'un appel à `validerZipSecurite(zip)` (défini dans `import-export.js`).
- Tout nouveau traitement de blob image ou PDF doit être précédé d'un appel
  à `validerMagicBytes(blob)` (défini dans `travaux-import.js`).
- Tout nouveau `JSON.parse(` sur du contenu importé devrait être suivi
  d'une validation de schéma (cf. le skill `securite-donnees` §6.3, règle 14).

Si un nouveau code d'import est présent sans la validation correspondante,
le signaler avec fichier et ligne.

### 2.6 Modules et zones sensibles

Si l'un des éléments suivants est modifié, le signaler avec rappel
«tests sécurité obligatoires» :

- `js/import-export.js`
- `js/travaux-import.js`
- `js/cc-license.js`
- `js/securite-*.js`
- Le bloc `<meta http-equiv="Content-Security-Policy">` dans `index.html`
- Le bloc CSP en tête de `index.html`

Si l'une des **zones protégées** est modifiée (CLAUDE.md), signaler comme
**bloquant** et demander confirmation avant de continuer :

- `js/config.js`
- `js/navigation.js`
- `noms_stables.json`

⏸ Rapporter à Grégoire tous les motifs détectés. Pas de correction automatique.

---

## 3. TESTS AUTOMATISÉS

**Objectif** : exécuter la suite de tests sécurité (Vitest + Playwright).

```bash
cd tests && npm run test:unit
```

⛔ **PAS `npm test`** (corrigé le 2 septembre 2026 ; ce skill le prescrivait
encore). Il enchaîne Vitest ET Playwright, plus de dix minutes. Le verdict
Playwright se prend séparément, et à un moment précis : voir §4.5.

Reporter :
- Nombre de tests passés / échoués
- Si échec : nom du test, fichier, ligne, message d'erreur condensé (3 lignes max)
- Temps total d'exécution (sanity check : si < 1s ou > 5min, signaler)

Si la suite n'est pas exécutable (erreur de setup, dépendances manquantes,
commande échouée avant le premier test), le signaler clairement plutôt que
de prétendre que les tests passent.

Cas particuliers à signaler explicitement :
- Tests skipés (`it.skip`, `describe.skip`)
- Tests marqués `only` (`it.only`, `describe.only`) — un commit avec un
  `only` est un bug : les autres tests ont été ignorés
- Snapshots Playwright désynchronisés

⏸ Si des tests échouent, demander à Grégoire s'il veut investiguer maintenant
(basculer vers le skill `debug-labo-codex`) ou continuer le rituel pour avoir le rapport
complet d'abord.

---

## 4. VÉRIFICATION ADVERSE

**Objectif** : prouver que les tests neufs/modifiés protègent vraiment, et que ce
que la session s'apprête à écrire dans SESSION.md correspond au diff réel. Applique
le skill `verification-adverse` (mode A — auto-vérification) : ce parent porte le
« pourquoi » et la procédure complète du break-test (§4 du parent). Ici, la version
courte projet.

> Le balayage mécanique (parent P3) est déjà couvert par le §2 ci-dessus. Cette
> étape ajoute le break-test (P2) et la confrontation récit↔diff (P1/P4) — ce qu'une
> suite verte ne donne PAS.

### 4.1 Break-test des tests neufs ou modifiés

Pour chaque test ajouté/modifié dans le diff qui couvre un correctif de **données,
sécurité, SSOT, ou garde-fou** (pas le microcopy) :

1. `cp <fichier-source-du-correctif> /tmp/bak`
2. Retirer le correctif (revert du hunk, ou inverser/neutraliser la ligne porteuse).
3. `cd tests && npx vitest run <fichier-test-ciblé>` → **attendu : ROUGE** sur
   l'assertion qui décrit le comportement.
4. `cp /tmp/bak <fichier-source>` ; vérifier `git status` propre (lecture seule, P5).

→ Si le test reste **VERT** sans le correctif : il est tautologique. Le signaler
comme **réserve** — le comportement n'est PAS prouvé, le correctif n'est pas couvert.

Proportionnalité (barème parent §5) : un break-test échantillon par chantier suffit
souvent ; les correctifs données/sécurité/SSOT l'exigent, l'UI/microcopy non.

### 4.1 bis Les specs Playwright touchés par la session (ajouté le 4 septembre 2026, consigne §10)

```bash
git diff --name-only <base>..HEAD -- tests/integration/ | xargs grep -n "page.click\|waitForTimeout"
```

→ **attendu : zéro**. Un geste de spec passe par l'événement DOM et attend le rendu (un élément qui
n'existe qu'après), jamais par `page.click` à l'aveugle ni `waitForTimeout` : sur le runner, un
clic souris coûte de 2 à 9 s et le budget de 30 s s'épuise — deux runs rouges le 4 septembre.
La règle et son motif : `docs/securite/TESTS-AUTOMATISES.md` §4. Un `page.click` qui reste se
justifie en une ligne (le clic qu'on éprouve).

### 4.2 Confrontation des affirmations au diff

Avant de rédiger le bilan de session (SESSION.md, message de commit) : pour chaque
affirmation chiffrée ou de complétude (« N lecteurs migrés », « X retiré partout »,
« tests verts », « bug réparé »), vérifier qu'elle correspond au diff/grep réel. Une
affirmation non re-dérivable se reformule en « non vérifié », jamais en fait acquis.

**Passe « connexions »** (parent P4) : si le chantier ajoute un garde-fou sur un
invariant partagé (une clé, une donnée), vérifier que les **chemins voisins** qui
touchent le même invariant sont couverts — pas seulement celui qu'on vient de
modifier.

> **Concrètement** : repérer les clés/données que le garde-fou contrôle (ses
> clés-témoins, sa cible), puis grep **tous** les écrivains de ces clés
> (`db.set`/`setSync`/`localStorage.setItem` sur la clé). Chaque écrivain qui ne
> passe pas par le garde-fou est un trou candidat. Exemple vérifié : le garde-fou
> de persistance #335-C contrôle `productions`/`evaluationsSauvegardees`/… à
> l'import, mais 7 autres sites écrivent `productions` sans lui (autosave,
> changement de trimestre) — c'est le territoire de #340.

⏸ Rapporter à Grégoire les réserves (tests tautologiques) et les écarts récit↔code.
Pas de correction automatique.

---

## 4.5 L'ORDRE DU VERDICT ET DU PUSH (promu le 2 septembre 2026)

*Promotion depuis la consigne de démarrage, règle 3 de `PROTOCOLE.md`.*

### ⚠⚠ « Push réussi » ne signifie pas « suite complète verte », et ne le signifiera jamais

Le hook pre-push lance **Vitest seulement**. Pour Playwright, il constate qu'aucun
verdict local n'existe **et laisse passer**. Ce n'est pas une prudence, c'est une
**impossibilité structurelle** : la suite dure plus de dix minutes sur cette
machine, et six minutes de silence ferment la connexion au serveur (#533). **Le
hook ne PEUT pas la lancer.**

### La méthode qui ferme ce trou

Le hook ne peut pas lancer la suite, **mais il sait lire un verdict**. L'ordre qui
marche, vérifié quatre fois le 1er septembre 2026 :

```
commit → relecture croisée → corrections → verdict → push
```

```bash
# 1. committer d'abord
# 2. (règle 2 de PROTOCOLE.md, si le lot est dans son périmètre) relecture croisée
# 3. seulement ensuite :
cd tests && node ../scripts/verifier-playwright.mjs
# 4. puis pousser
```

Le jeton porte alors le SHA du commit, et le hook affiche « ✓ Sentinelle
Playwright : **verdict vert à jour pour ce commit** » au lieu de « aucun verdict
local ». **C'est la seule façon qu'un push soit réellement jugé.**

Les gardes du verdict (éveil complet, veilles, mémoire ; #1008) vivent dans
`scripts/verifier-playwright.mjs` lui-même : un lancement à la main en est
couvert comme `pousser.sh`, et un code 2 « non jugé » dit laquelle a refusé.

### Le verdict en dix morceaux : `scripts/verdict-en-morceaux.mjs` (27 octobre 2026)

D'un bloc, la suite ne tient plus dans la mémoire du Mac à côté de Cowork. Le
geste du soir est désormais :

```bash
node scripts/verdict-en-morceaux.mjs            # dix morceaux, fusion, jugement, jeton
node scripts/verdict-en-morceaux.mjs --reporter # reporter un vert sur un commit de tests seulement
```

Avant : Cowork, Chrome et Safari fermés, Mac sur secteur. Il juge contre
`playwright-baseline.json`, comme `verifier-playwright.mjs`, et écrit le même
jeton : le hook le lit sans changement. Puis `git push` (et non `pousser.sh`,
qui relancerait la suite d'un bloc). Codes : 0 vert, 1 rougeur nouvelle,
2 NON JUGÉ (la garde qui a refusé est nommée), 3 report refusé (la suite entière
repasse). `--reporter` n'accepte qu'un diff limité à `plans de travail/`,
`tests/integration/*.spec.js` et `tests/unit/`, et rejoue chaque spec touchée.

⚠ **Repli, gardé tant que le script n'a pas fait ses preuves** (première course :
la vérification du soir du 27 oct.) : la procédure à la main —
`node scripts/morceau-playwright.mjs <n> 10` pour n = 1 à 10 sous
`caffeinate -d -i -s`, fusion des rapports blob, jugement contre
`playwright-baseline.json`, jeton écrit au format de `verifier-playwright.mjs`
(sa `garde.raison` le dit). Si le script refuse ou casse, on reprend à la main,
et le refus va dans le rapport du soir.

⚠ **Un commit APRÈS le verdict le périme.** Refaire dans cet ordre, ou accepter
que le push passe sans jugement, et le DIRE.
⚠ **Le verdict est le DERNIER geste avant le push, jamais avant la relecture** :
toute correction issue de la relecture périme un verdict déjà pris. Le
1er septembre, **cinq lancements ont été gaspillés pour un seul verdict utile**.
⚠ Lire le **jeton** (`scripts/.verdict-playwright.json`), pas un code de sortie
tuyauté. Il porte aussi `instables` : un vert rattrapé au second essai ne
ressemble plus à un vert franc (#685).

---

## 4.6 DEUX GARDES DU VERDICT (déplacées de `PROTOCOLE.md` le 13 septembre 2026)

*Anciennes règles 7 et 8 du protocole. Elles sont ici parce que ce sont des gestes de clôture ;
le protocole n'en garde qu'une ligne de renvoi, et la part de coordination de la seconde (qui
ferme Cowork).*

### 4.6.1 Un vert local ne prouve rien sur ce que la CI exécute (ex-règle 7, 2 septembre 2026)

*Trois occurrences le même jour, ce qui est exactement le seuil que la règle 3 de `PROTOCOLE.md`
fixe pour faire monter une leçon.*

| ce qui a cassé | sur le poste | sur le runner |
|---|---|---|
| un script de session (matin) | `zsh` | `bash` |
| `sentinelle-635` (midi) | Node 24 expose `navigator` | Node 20 ne l'a pas |
| la garde des essais non jugés (soir) | BSD `cut` accepte un séparateur multi-octet | GNU `cut` le refuse |

▣ **Ce n'est pas trois défauts, c'est un angle mort unique** : le poste de Grégoire est plus
permissif que le serveur, et il rend vert ce qui ne l'est pas. **Le vert local est la chose
même qui a masqué les trois.**

⮕ **La règle** : *ce que la CI exécute ne s'écrit pas avec les outils du poste.* Quand un calcul
doit tourner là-bas, il va dans l'interpréteur le moins dépendant de la plateforme disponible —
en pratique **`node`**, qui est déjà installé et dont la version est **déclarée dans le workflow**.
⛔ **Pas de `cut`, `sed`, `awk`, `date`, `readlink`, `sort -V` dans une étape de CI** dès qu'un
équivalent `node` existe. Leurs dialectes diffèrent silencieusement entre BSD et GNU.

⮕ **Et le corollaire, qui vaut pour les tests** : un bac à sable qui n'énumère pas ses globals
en emprunte à l'interpréteur. Le test réussit alors **pour une raison qui n'est pas la sienne**.
⚠ Un test vert sur un global qu'il n'a pas déclaré est un test qui ne garde rien — il attend
seulement une machine assez généreuse.

▣ **Le témoin de la règle** : le 2 septembre, la correction retenue chaque fois a été la même —
**déplacer le calcul dans `node`**, ou **déclarer le global manquant**. Jamais « ajuster pour que
ça passe ici ».

⮕ **Ajouté le 4 septembre 2026 (décision de Grégoire, consigne du jour §10)** : on ne retient plus
un push pour laisser finir un run GitHub — le run annulé par `cancel-in-progress` n'est pas perdu,
le suivant juge le sommet de la branche, qui contient tout ce qui précède ; le verdict au jeton
local (`scripts/pousser.sh`) reste le dernier geste avant chaque push, et le rituel d'ouverture lit
les JOBS du dernier run (jugé vert, jugé rouge, non jugé).

### 4.6.2 Le verdict Playwright local ne se prend pas à deux outils ouverts (ex-règle 8, 12 septembre 2026)

**Fait mesuré par Grégoire le 12 septembre au matin** : les redémarrages nocturnes des 9, 10 et 11 septembre sont des paniques
noyau par chien de garde (`watchdog timeout`, `kernel_task`), précédées de vingt minutes de pression mémoire extrême sur 16 Go
(Jetsam à 22 h 17 et 22 h 22 le 11 : ~7,5 Go compressés, 250 Mo libres, load average 20). Ce qui pesait : la VM Apple
Virtualization de **Cowork** (~2,9 Go), WindowServer, cinq WebContent Safari, le renderer de Claude — **au moment où Claude Code
lançait le verdict Playwright local** (navigateurs WebKit en série), juste après les commits de release de 21 h 44-21 h 49.
Le 11, la marche a été coupée entre le verdict et le push : 1.135.0 committée, jamais poussée ; en ligne, l'état intermédiaire
`af574fd2` sous un faux numéro.

**La règle** :
1. Le verdict Playwright local (`scripts/verifier-playwright.mjs`) **ne se lance pas pendant qu'une session Cowork est ouverte**.
   Qui la ferme, et ce que Claude Code dit avant de lancer : `PROTOCOLE.md`, règle 8 (c'est de la coordination, elle y reste).
2. En fin de journée, **la marche s'arrête AVANT le verdict** si Grégoire ferme ; le verdict et le push se prennent le lendemain
   matin, Cowork fermé. Une livraison ne se termine pas la nuit, sans personne — c'est aussi la règle 6 de `PROTOCOLE.md`
   (« une seule livraison par séance, à la fin, et il regarde avant »).
3. Quand le verdict doit quand même tourner à côté d'autre chose : `--workers=1` (plus lent, sans pic), et la pression mémoire du
   Moniteur d'activité doit rester verte.
4. Un push qui suit un verdict interrompu n'a pas de verdict : on le dit, on ne le suppose pas (`git reflog show origin/main` fait foi).

**Ce qui ne change pas** : la CI GitHub reste le second verdict (§4.6.1) ; tant que `#833` la laisse rouge sur des specs sans
rapport, le verdict local est le seul, d'où l'importance de le prendre dans de bonnes conditions.

---

## 5. VERSION : BUMP VIA LE SCRIPT DE RELEASE

**Objectif** : si ce commit doit changer le numéro de version, le faire par
le script officiel — jamais à la main. La version vit dans **4 points de
vérité** (`version.json`, deux fallbacks `VERSION_MAJEURE`/`BUILD_ID` dans
`js/init-inline.js`, le snapshot `window._SCRIPT_BUILD_main` dans `js/main.js`).
Les recopier manuellement les désynchronise — c'est précisément ce que le
script empêche (cf. BACKLOG #285).

### 5.1 Décider l'intention (jugement de Grégoire)

- **patch** (`1.0.0 → 1.0.1`) — correction de bug, rien de neuf à l'usage
- **minor** (`1.0.1 → 1.1.0`) — nouveauté sans rupture
- **major** (`1.1.0 → 2.0.0`) — rupture ou changement de format de données.
  **Confirmer explicitement avec Grégoire avant un `major`** (acte public).

`patch`/`minor` relèvent du jugement courant ; ne jamais décider d'un `major` seul.

### 5.2 Lancer le script (écriture atomique des 4 points)

```bash
node scripts/release.mjs patch|minor|major
# ou : node scripts/release.mjs --set X.Y.Z      (fixer une version précise)
# ou : node scripts/release.mjs --build-only      (commit doc/UI sans changer le numéro)
node scripts/release.mjs minor --dry-run          # prévisualiser sans rien écrire
```

Toujours prévisualiser avec `--dry-run` d'abord, puis relancer sans l'option.
Le script calcule le numéro SemVer, horodate le build (Toronto, `MMJJ-HHMM`)
et synchronise les 4 points d'un seul geste — soit tout, soit rien.

`version.json` reste la **source unique de vérité** ; « Bêta publique » n'est
qu'un libellé d'affichage, pas le numéro.

### 5.3 Vérifier la cohérence après coup

Le contrôle n'est plus une comparaison manuelle de sources : c'est `git diff`
après release.mjs. Confirmer que les 4 points portent le même numéro/build :
- `version.json` (`beta` + `build`)
- `js/init-inline.js` (`VERSION_MAJEURE` + `BUILD_ID`)
- `js/main.js` (`window._SCRIPT_BUILD_main`)

Si le diff montre une désynchronisation, c'est que le script a échoué ou
n'a pas tourné — ne pas committer, le relancer. Ne jamais éditer ces valeurs
à la main.

---

## 5 bis. FERMER LE RELAIS — fusion vers `main`, ou filet explicite

> **Règle adoptée par Grégoire le 8 août 2026**, après une journée perdue à
> réconcilier deux sessions parties du même commit sans se voir.

### 5bis.1 Le geste par défaut : fusionner vers `main`

Une fois la version bumpée et la suite verte, **fusionner la branche de travail
dans `main` et pousser**. C'est le remède, pas une formalité : c'est le REPORT
du merge qui ouvre la fenêtre de divergence.

```bash
git push -u origin <branche>
git checkout main && git merge --ff-only <branche>
git push origin main
```

⚠ **Avant de pousser `main`, relancer la suite sur l'état fusionné** — pas
reprendre l'attestation de la branche. Et si la fusion n'est pas un
fast-forward, c'est qu'une AUTRE session a poussé entre-temps : s'arrêter et le
signaler à Grégoire plutôt que de résoudre seul des conflits qu'on n'a pas
instruits.

### 5bis.2 Si le merge doit vraiment attendre

Cas légitimes : travail à mi-chemin, validation terrain en suspens, décision de
Grégoire non prise. Alors, et **seulement** alors :

1. remplir `RELAIS.md` à la racine (modèle à la fin du fichier) en nommant la
   branche, sa version, et ce qu'elle porte ;
2. le committer et le **pousser sur `main` SEUL**, sans le reste du travail.

⮕ **Pourquoi sur `main`** : le §3 de `SESSION.md` est un fichier versionné. S'il
vit sur une branche non mergée, la session suivante lira celui de `main`, qui
sera périmé — et son rituel de début ne verra **aucun écart**, parce qu'il aura
vérifié une prémisse fausse. `RELAIS.md` est le seul point que toute session
lit, quelle que soit la branche ouverte.

### 5bis.3 Dans les deux cas

Remettre `RELAIS.md` à jour : « aucun travail en avance » après une fusion, ou
la branche et sa dette après un report. Un `RELAIS.md` périmé est pire que pas
de `RELAIS.md` — il donne une fausse assurance à la session suivante.

---

## 6. RAPPORT FINAL

**Objectif** : produire une synthèse en une seule sortie lisible.

Format à respecter :

```
=== RITUEL DE FIN DE SESSION ===

Périmètre : N fichiers modifiés depuis le dernier commit
  - js/         : [N fichiers — liste si ≤ 10]
  - tests/      : [N fichiers]
  - index.html  : [oui/non]
  - autres      : [liste]

Audit sécurité statique :
  ✅ Aucun motif détecté
  ou
  ⚠ N motifs détectés :
    - [fichier]:[ligne] — [type 2.x] — [extrait condensé]
    ...
  ❌ Motifs bloquants : [si présents — eval, zones protégées]

Tests automatisés :
  ✅ N/N passés en T secondes
  ou
  ❌ K/N échecs :
    - [test] : [message condensé]
    ...

Vérification adverse :
  ✅ N break-tests sur correctifs risqués → N rouges attendus obtenus
  ou
  ⚠ Réserves :
    - [test tautologique] : reste vert sans le correctif → comportement non prouvé
    - [écart récit↔diff] : affirmation « … » non re-dérivée → reformuler en « non vérifié »
  — (aucun correctif données/sécurité/SSOT dans le diff → étape sans objet)
  Skill `verification-adverse` chargé SEUL (sans qu'on le nomme) : [oui / non]
    ⮕ Témoin de la condition de levée de la règle 10 de PROTOCOLE.md (13 sept. 2026) :
      elle ne part vers ce skill qu'après DEUX « oui » ; avant, un skill qui ne se
      charge pas la rendrait moins lue.

Version :
  ✅ 4 points de vérité synchrones (X.Y.Z / MMJJ-HHMM)
  ou
  ⚠ Désynchronisation (relancer release.mjs, ne pas éditer à la main) :
    - version.json      : X.Y.Z / MMJJ-HHMM
    - js/init-inline.js : A.B.C / MMJJ-HHMM
    - js/main.js        : MMJJ-HHMM

Prochaines étapes possibles (à choisir par Grégoire) :
  1. Corriger les éléments signalés
  2. Décider l'intention de version (patch/minor/major — major = confirmer)
  3. node scripts/release.mjs <intention> (--dry-run d'abord)
  4. Committer
```

⏸ S'arrêter ici. Ne RIEN modifier, ne RIEN committer sans demande explicite.

---

## 7. CE QUE CETTE SKILL NE FAIT PAS

- Ne corrige pas automatiquement les motifs détectés
- N'édite pas les 4 points de vérité à la main — le bump passe par `release.mjs`
- N'exécute pas `git add`, `git commit`, `git push`
- Ne décide pas seul de l'intention de version — `major` se confirme avec Grégoire
- Ne se substitue pas au skill `debug-labo-codex` si un bug réel est découvert
- Ne remplace pas la lecture humaine du diff avant commit — c'est un filet,
  pas une garantie

---

## ANTI-PATTERNS À ÉVITER

- ❌ Corriger silencieusement un motif détecté sans le signaler
- ❌ Sauter l'audit §2 parce que «les tests passent» (les tests ne couvrent
  pas toutes les règles)
- ❌ Sauter les tests §3 parce que «l'audit ne détecte rien» (l'audit est
  statique, il rate la logique runtime)
- ❌ Déclarer un correctif (données/sécurité/SSOT) «couvert» sans avoir fait
  rougir son test (§4.1) — un test vert peut être tautologique
- ❌ Recopier une affirmation de session («N migrés», «retiré partout») dans le
  bilan sans l'avoir re-dérivée au diff/grep (§4.2)
- ❌ Éditer `version.json`, les fallbacks de `init-inline.js` ou le snapshot de
  `main.js` à la main au lieu de lancer `release.mjs`
- ❌ Prétendre que la version est synchrone sans avoir vérifié le `git diff` des 4 points
- ❌ Décider seul d'un bump `major` (changement public) sans confirmation de Grégoire
- ❌ Confondre un avertissement avec un bloquant : seuls §2.3 (eval), §2.6
  (zones protégées) et les échecs de tests sont bloquants ; le reste est
  à arbitrer par Grégoire
- ❌ Modifier le code en cours de rituel — le rituel est en lecture seule
- ❌ Mélanger ce rituel avec un debug actif — si un bug surface, le rituel
  s'arrête, on passe au skill `debug-labo-codex`, on reprend le rituel après

---

## HISTORIQUE

| Date       | Changement                                                |
|------------|-----------------------------------------------------------|
| 2026-05-11 | Création. Audit statique, tests, cohérence version, rapport sans modification automatique. |
| 2026-06-11 | §4 réécrite : bump de version par `scripts/release.mjs` (4 points de vérité, `--dry-run`) au lieu de l'édition manuelle de `index.html` (fallbacks déplacés dans `init-inline.js`). Renvoi CLAUDE.md pour §2.1-2.3, dispatcher recité (`[data-action]` ≈ 780-836). |
| 2026-06-14 | Nouveau §4 « Vérification adverse » (break-test des tests neufs/modifiés + confrontation récit↔diff + passe « connexions »), instanciant le skill `verification-adverse` (mode A). Renumérotation §4-6 → §5-7. Né des audits du 13-14 juin (7 break-tests, défaut transversal #340). |
| 2026-09-13 | Nouveau §4.6 : les règles 7 et 8 de `PROTOCOLE.md` déplacées ici (gestes de clôture) ; le protocole garde le renvoi et « qui ferme Cowork ». Au rapport, le témoin « `verification-adverse` chargé seul », condition de levée de la règle 10. |
