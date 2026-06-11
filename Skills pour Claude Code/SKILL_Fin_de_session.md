---
name: fin-de-session-labo-codex
description: >
  Workflow exécutable de fin de session pour Labo Codex. Déclencher dès que
  Grégoire dit «rituel de fin de session», «applique le rituel», «avant qu'on
  commit», «j'ai fini pour aujourd'hui», «vérifie avant de pousser», ou toute
  formulation signalant la clôture d'une session de travail. Audit du code
  modifié contre les règles non négociables de CLAUDE.md (section sécurité)
  et SKILL_Securite_donnees.md §9, exécution de la suite de tests, bump de
  version par `scripts/release.mjs` si nécessaire. Rapport sans modification
  automatique — toute correction reste à la décision de Grégoire.
  Prérequis : SKILL_Securite_donnees.md pour le contexte des règles vérifiées.
---

# SKILL : Rituel de fin de session — Labo Codex

> Cette skill est une procédure exécutable, pas une référence. Elle automatise
> ce qu'un développeur consciencieux ferait avant chaque commit, en s'appuyant
> sur les règles déjà documentées (CLAUDE.md section sécurité, SKILL_Securite_donnees.md §9).
> Elle est en lecture seule : aucune modification de fichier, aucun commit, aucun push.

---

## 0. QUAND DÉCLENCHER

- Fin de séance de travail
- Avant tout `git commit`
- Avant tout `git push`
- À la demande explicite de Grégoire

Ne PAS déclencher pendant un debug en cours (utiliser SKILL_Debug.md),
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
- racine — fichiers de config (version : bump via `release.mjs` au §4)

⏸ Rapporter à Grégoire le périmètre détecté. S'il dit «ce n'est pas ce que je
veux vérifier», ajuster avant de passer à l'étape 2.

---

## 2. AUDIT SÉCURITÉ STATIQUE

**Objectif** : sur chaque fichier JS et HTML modifié, chercher les motifs
interdits par CLAUDE.md (section « Regles de securite ») et
SKILL_Securite_donnees.md §9. Signaler sans corriger.

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
  d'une validation de schéma (cf. SKILL_Securite_donnees.md §6.3, règle 14).

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
cd tests && npm test
```

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
(basculer vers SKILL_Debug.md) ou continuer le rituel pour avoir le rapport
complet d'abord.

---

## 4. VERSION : BUMP VIA LE SCRIPT DE RELEASE

**Objectif** : si ce commit doit changer le numéro de version, le faire par
le script officiel — jamais à la main. La version vit dans **4 points de
vérité** (`version.json`, deux fallbacks `VERSION_MAJEURE`/`BUILD_ID` dans
`js/init-inline.js`, le snapshot `window._SCRIPT_BUILD_main` dans `js/main.js`).
Les recopier manuellement les désynchronise — c'est précisément ce que le
script empêche (cf. BACKLOG #285).

### 4.1 Décider l'intention (jugement de Grégoire)

- **patch** (`1.0.0 → 1.0.1`) — correction de bug, rien de neuf à l'usage
- **minor** (`1.0.1 → 1.1.0`) — nouveauté sans rupture
- **major** (`1.1.0 → 2.0.0`) — rupture ou changement de format de données.
  **Confirmer explicitement avec Grégoire avant un `major`** (acte public).

`patch`/`minor` relèvent du jugement courant ; ne jamais décider d'un `major` seul.

### 4.2 Lancer le script (écriture atomique des 4 points)

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

### 4.3 Vérifier la cohérence après coup

Le contrôle n'est plus une comparaison manuelle de sources : c'est `git diff`
après release.mjs. Confirmer que les 4 points portent le même numéro/build :
- `version.json` (`beta` + `build`)
- `js/init-inline.js` (`VERSION_MAJEURE` + `BUILD_ID`)
- `js/main.js` (`window._SCRIPT_BUILD_main`)

Si le diff montre une désynchronisation, c'est que le script a échoué ou
n'a pas tourné — ne pas committer, le relancer. Ne jamais éditer ces valeurs
à la main.

---

## 5. RAPPORT FINAL

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

## 6. CE QUE CETTE SKILL NE FAIT PAS

- Ne corrige pas automatiquement les motifs détectés
- N'édite pas les 4 points de vérité à la main — le bump passe par `release.mjs`
- N'exécute pas `git add`, `git commit`, `git push`
- Ne décide pas seul de l'intention de version — `major` se confirme avec Grégoire
- Ne se substitue pas à SKILL_Debug.md si un bug réel est découvert
- Ne remplace pas la lecture humaine du diff avant commit — c'est un filet,
  pas une garantie

---

## ANTI-PATTERNS À ÉVITER

- ❌ Corriger silencieusement un motif détecté sans le signaler
- ❌ Sauter l'audit §2 parce que «les tests passent» (les tests ne couvrent
  pas toutes les règles)
- ❌ Sauter les tests §3 parce que «l'audit ne détecte rien» (l'audit est
  statique, il rate la logique runtime)
- ❌ Éditer `version.json`, les fallbacks de `init-inline.js` ou le snapshot de
  `main.js` à la main au lieu de lancer `release.mjs`
- ❌ Prétendre que la version est synchrone sans avoir vérifié le `git diff` des 4 points
- ❌ Décider seul d'un bump `major` (changement public) sans confirmation de Grégoire
- ❌ Confondre un avertissement avec un bloquant : seuls §2.3 (eval), §2.6
  (zones protégées) et les échecs de tests sont bloquants ; le reste est
  à arbitrer par Grégoire
- ❌ Modifier le code en cours de rituel — le rituel est en lecture seule
- ❌ Mélanger ce rituel avec un debug actif — si un bug surface, le rituel
  s'arrête, on passe à SKILL_Debug.md, on reprend le rituel après

---

## HISTORIQUE

| Date       | Changement                                                |
|------------|-----------------------------------------------------------|
| 2026-05-11 | Création. Audit statique, tests, cohérence version, rapport sans modification automatique. |
| 2026-06-11 | §4 réécrite : bump de version par `scripts/release.mjs` (4 points de vérité, `--dry-run`) au lieu de l'édition manuelle de `index.html` (fallbacks déplacés dans `init-inline.js`). Renvoi CLAUDE.md pour §2.1-2.3, dispatcher recité (`[data-action]` ≈ 780-836). |
