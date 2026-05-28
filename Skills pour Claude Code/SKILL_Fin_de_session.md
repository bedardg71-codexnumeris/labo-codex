---
name: fin-de-session-labo-codex
description: >
  Workflow exécutable de fin de session pour Labo Codex. Déclencher dès que
  Grégoire dit «rituel de fin de session», «applique le rituel», «avant qu'on
  commit», «j'ai fini pour aujourd'hui», «vérifie avant de pousser», ou toute
  formulation signalant la clôture d'une session de travail. Audit du code
  modifié contre les règles non négociables de CLAUDE.md (section sécurité)
  et SKILL_Securite_donnees.md §9, exécution de la suite de tests, vérification
  de la cohérence de version. Rapport sans modification automatique — toute
  correction reste à la décision de Grégoire.
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
- racine — fichiers de config (`version.json` à surveiller §4)

⏸ Rapporter à Grégoire le périmètre détecté. S'il dit «ce n'est pas ce que je
veux vérifier», ajuster avant de passer à l'étape 2.

---

## 2. AUDIT SÉCURITÉ STATIQUE

**Objectif** : sur chaque fichier JS et HTML modifié, chercher les motifs
interdits par CLAUDE.md et SKILL_Securite_donnees.md §9. Signaler sans corriger.

### 2.1 innerHTML non échappé

Motif : `innerHTML\s*[+]?=` sans appel à `echapperHtml()` dans la même expression
ou les ~5 lignes au-dessus dans la même fonction.

Exemple à signaler :
```javascript
container.innerHTML = '<div>' + etudiant.nom + '</div>';  // ⚠ nom non échappé
```

Pattern correct :
```javascript
container.innerHTML = '<div>' + echapperHtml(etudiant.nom) + '</div>';
```

Exceptions légitimes (ne pas signaler) :
- `innerHTML = ''` (vidage)
- Injection de chaînes 100% statiques sans interpolation de variable
- Contenu issu d'une source déjà échappée explicitement plus haut (rare)

### 2.2 Handlers inline

Motif : `on\w+=` (onclick, onchange, onload, onerror, onfocus, etc.) dans
une chaîne de caractères injectée via innerHTML, template literal destiné
à innerHTML, ou attribut HTML statique.

Exemple à signaler :
```javascript
html += '<button onclick="faireQuelqueChose()">Cliquer</button>';
```

Pattern correct : utiliser `data-action`, `data-on-change`, etc., et le
dispatcher de `main.js` (lignes 700-780).

### 2.3 Évaluations dynamiques

Motifs : `eval(`, `new Function(`, `setTimeout('` (chaîne au lieu de fonction),
`setInterval('` (idem).

Tolérance zéro. Si présent, signaler comme **bloquant** — la CSP `script-src 'self'`
les bloque déjà, mais le code doit être sûr indépendamment du CSP.

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

## 4. COHÉRENCE DE LA VERSION

**Objectif** : vérifier que les trois sources de la version sont synchrones.

### 4.1 Source unique de vérité

Lire `version.json` à la racine :
```json
{"build":"MMJJ-HHMM","beta":"XX.X"}
```

### 4.2 Fallbacks hors-ligne

Chercher dans `index.html` (autour de la ligne 17166, ou via grep `VERSION_MAJEURE`) :
```javascript
let VERSION_MAJEURE = '...';
let BUILD_ID = '...';
```

### 4.3 Vérification

Les trois valeurs doivent être identiques :
- `version.json:beta` == `VERSION_MAJEURE` dans `index.html`
- `version.json:build` == `BUILD_ID` dans `index.html`

Si désynchronisation, signaler les valeurs trouvées dans chaque source.
**NE PAS modifier sans validation explicite** — Grégoire décide du numéro
de beta pour ce commit (CLAUDE.md le précise : ne jamais renuméroter
automatiquement).

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
  ✅ version.json et fallbacks synchrones (Beta XX.X / MMJJ-HHMM)
  ou
  ⚠ Désynchronisation :
    - version.json : Beta XX.X / MMJJ-HHMM
    - index.html   : Beta YY.Y / MMJJ-HHMM

Prochaines étapes possibles (à choisir par Grégoire) :
  1. Corriger les éléments signalés
  2. Décider du numéro de beta pour ce commit
  3. Mettre à jour version.json et les fallbacks
  4. Committer
```

⏸ S'arrêter ici. Ne RIEN modifier, ne RIEN committer sans demande explicite.

---

## 6. CE QUE CETTE SKILL NE FAIT PAS

- Ne corrige pas automatiquement les motifs détectés
- Ne modifie pas `version.json` ni les fallbacks
- N'exécute pas `git add`, `git commit`, `git push`
- Ne décide pas du numéro de beta — prérogative de Grégoire (CLAUDE.md)
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
- ❌ Committer sans demander le numéro de beta à Grégoire
- ❌ Prétendre que la version est synchrone sans avoir vérifié les trois sources
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
