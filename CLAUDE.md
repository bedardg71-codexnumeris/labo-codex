# Monitorage Pédagogique — Guide Claude Code

> **Ce fichier est un point d'entrée léger, chargé à chaque session.**
> Tout ce qui est volumineux ou conditionnel vit dans `.claude/skills/`
> et se charge à la demande. Ne rien ajouter ici sans retirer autant.
> Cible : moins de 200 lignes.

---

## Lecture obligatoire

**Commence TOUJOURS par** : `docs/00-START-HERE.md`

---

## Avant de coder

**REGLE DE RELAIS (8 août 2026)** : on FUSIONNE vers `main` à la fin de CHAQUE
session. Si un merge doit vraiment attendre, remplir `RELAIS.md` à la racine et
le pousser sur `main` SEUL. Motif : le 8 août, deux sessions sont parties du même
commit sans se voir, chacune a livré une « 1.55.0 » différente et pris les mêmes
identifiants de backlog. `RELAIS.md` est le seul point que toute session lit,
quelle que soit la branche ouverte.

**EN TOUT PREMIER, AU DÉBUT DE CHAQUE SESSION** : **déléguer le rituel au
subagent `audit-debut-session`**, qui exécute le skill `debut-de-session-labo-codex`
dans un contexte isolé et ne renvoie que son rapport (~500 tokens au lieu de
~135 000 de bruit relu à chaque tour). Audit factuel git + tests + version,
lecture ciblée de `SESSION.md`/`BACKLOG.md`, comparaison avec la prémisse de
relance reçue. Lecture seule, aucune modification. Acté le 28 mai 2026 après un
écart de 24 h sur le Lot A ✴.

⚠ **Vitest se lance DEPUIS `tests/`**, jamais de la racine : de la racine il
balaie `.claude/worktrees/` sans la config et rend 217 fichiers rouges.

⚠ **Lectures ciblées obligatoires.** `SESSION.md` fait ~7 600 lignes et
`BACKLOG.md` ~1 300, avec des lignes de plusieurs milliers de caractères. **Ne
jamais les lire sans `offset`/`limit`** : un `Read` par défaut sur `SESSION.md`
coûte ~106 000 tokens. Lire l'en-tête, puis cibler.

Ensuite, selon le chantier :

1. `docs/00-START-HERE.md`
2. `BACKLOG.md` (tâches en attente) et `SESSION.md` (contexte récent)
3. `ETAT-PROJET.md` pour se situer vis-à-vis des objectifs de stabilité,
   pérennité et qualité, et de l'avancement des plans
4. Le module concerné dans `docs/modules/`, et `docs/legacy/` pour les
   problèmes connus

**Les skills métier se chargent tout seuls** selon le chantier (architecture,
notation, cadre pédagogique, RàI, sécurité, intégrité des globaux, portes
terrain, vérification adverse, design d'interface, release). Les invoquer par
leur nom si l'un ne se déclenche pas alors qu'il devrait : c'est le signal que
sa `description` est à corriger.

---

## Priorité absolue : retours testeurs

**Quand un testeur signale un bug ou un besoin, on interrompt le plan en cours.**
Les retours utilisateurs passent AVANT le backlog prévu.

- `Retours des testeurs/SUIVI-BUGS.md` — bugs ouverts vs corrigés. Consulter
  **de façon ciblée** (le fichier fait 120 Ko) AVANT de corriger un bug.
- `Retours des testeurs/USAGE-FORMATS.md` — journal d'observation sur l'usage
  des formats. Si une observation pertinente émerge en session, l'y noter en
  moins de 30 secondes (date + initiales + 1-3 lignes).

---

## Principes directeurs

### Stabilité zéro-dette (21 avril 2026)

> Dans un projet sans base d'utilisateurs, il n'y a pas de contrainte de
> rétro-compatibilité au-delà de la préservation des données personnelles du
> développeur. Tout nouveau chantier RETIRE ce qu'il remplace, il ne l'empile
> pas à côté. La stabilité prime sur la vitesse de livraison.

- Un chantier n'est pas fini tant que l'ancien système n'est pas retiré. Pas
  d'alias « au cas où », pas de code mort « pour plus tard ».
- Refactoriser est **attendu** si cela améliore la stabilité, même si le scope
  s'élargit.
- Avant de changer un défaut de préférence, un flag ou une signature : auditer
  les call-sites pour détecter le code dormant qui pourrait se réveiller.
  (Cas d'école : commit `51e5cdc` du 20 avril, primo-accueil réveillé.)
- Pas de report. Pas de chantiers « à reporter ».
- **Seule contrainte de rétro-compat** : les données personnelles de Grégoire
  (trimestres réels, grilles, évaluations) survivent aux changements.

### Single Source of Truth

Chaque donnée a UNE source unique. Les modules ne se parlent JAMAIS directement :
communication via localStorage/IndexedDB uniquement. Registre des clés avec
propriétaires : `docs/DATA-OWNERSHIP.md`.

### Namespacing

Les données sont préfixées par trimestre (`h2026_groupeEtudiants`,
`a2025_presences`). Utiliser `window.cle('nomCle')`.

---

## Architecture des données

**Document fondateur** : `docs/architecture/ECOSYSTEME-DONNEES.md` (26 avril 2026).

Quatre concepts : **Codex** (espace de travail actif), **Archives** (dépôt local),
**Codex data** (format recherche), **Voûte** (bibliothèque partagée).
Lire ce document AVANT de toucher à `codex.js`, `import-export.js`, `db.js` ou
`travaux-stockage.js`.

---

## Contraintes techniques

- **Stack** : HTML5 / CSS3 / JavaScript ES6+ pur (aucune dépendance externe sauf Chart.js)
- **Stockage** : hybride localStorage (< 200 Ko) + IndexedDB/memoryCache (> 200 Ko) via `db.js`
- **Fonctionnement** : 100 % hors-ligne
- **CSP** : `script-src 'self'` — zéro script inline, zéro `eval()`

---

## Règles de sécurité — NON NÉGOCIABLES

**Tout nouveau code DOIT les respecter.** (Audit du 26 mars 2026. Détail,
exemples et modèle de menaces : skill `securite-donnees`.)

1. **`innerHTML` + données utilisateur** → `echapperHtml()` obligatoire, sans
   exception. Concerne noms d'étudiants, titres de productions, texte libre,
   données importées.
2. **Zéro handler inline** (`onclick=`, `onchange=`…) dans le HTML généré.
   Utiliser `data-action` / `data-on-change` (dispatcher dans `main.js`).
3. **Tout import ZIP** passe par `validerZipSecurite(zip)` (`import-export.js`).
4. **Tout import image/PDF** passe par `validerMagicBytes(blob)` (`travaux-import.js`).
5. **Zéro `console.log`** dans le nouveau code : `console.warn` / `console.error`
   uniquement. Les `console.log` de debug sont retirés avant commit.
6. **Tout chantier sécurité Phase 1+ ajoute au minimum 1 test** couvrant la
   défense livrée. Fonction pure → Vitest dans `tests/unit/`. Comportement
   navigateur → Playwright dans `tests/integration/`.

Avant un commit touchant `js/securite-*.js`, `js/import-export.js`,
`js/cc-license.js` ou la CSP d'`index.html` : `cd tests && npm test`.
Documentation : `docs/securite/TESTS-AUTOMATISES.md`.

---

## Zones protégées

**NE JAMAIS MODIFIER sans autorisation** :

- `js/config.js` — configuration navigation
- `js/navigation.js` — logique navigation
- `noms_stables.json` — registre des noms protégés

---

## Procédure de développement

1. Discussion sur la fonctionnalité (Cowork au besoin)
2. Lire les fichiers concernés AVANT de planifier
3. Planification détaillée, étape par étape
4. Anticiper les erreurs utilisateur sur Mac et iPad **séparément**
5. Implémenter UN fichier à la fois, valider fonctionnellement après chacun
6. Déboguer avant de passer à l'étape suivante
7. Documenter, committer et pousser seulement après validation
8. En fin de session : ce qui est fait, ce qui reste, les risques

**Travail visuel ou UI** → le skill `design-interface` se charge ; `design-system.html`
reste la source de vérité.

---

## Avant chaque commit

**Lancer `/fin-de-session`** (rituel complet, dont le break-test du §4 : faire
ROUGIR chaque sentinelle de correctif données/sécurité/SSOT avant de lui faire
confiance). Le filet mécanique (contrôle `innerHTML` au commit, Vitest au push)
s'active seul via le hook SessionStart. Le §4 adverse reste à ta charge : c'est
l'étape que le biais d'auteur saute.

Puis le skill `release-et-changelog` pour le bump de version et le changelog.
En résumé : décider l'intention (`patch` / `minor` / `major`, **confirmer avec
Grégoire avant un `major`**), lancer `node scripts/release.mjs <intention>`,
vérifier `git diff`, puis `cd tests && npm test`.

> `version.json` est la **source unique de vérité**. « Bêta publique » est un
> libellé d'affichage, pas le numéro.

---

## En cas de doute

**Pose la question plutôt que de supposer.**
Grégoire a la mémoire contextuelle réelle du projet.
