# Consigne — Plugin de productivité et copie compte de `design-interface`

> Document de travail destiné à une session **Claude Code lancée depuis le
> terminal du Mac de Grégoire**. Préparé le 18 août 2026 par une session cloud
> qui a pu *diagnostiquer* ces deux points mais pas les *appliquer* : ils
> touchent des réglages hors dépôt. Supprimable après usage — ne fait pas
> partie du code applicatif.

---

## 1. Pourquoi cette consigne existe

Un audit des skills (17-18 août) a confirmé que les **15 skills de
`.claude/skills/` fonctionnent** : frontmatter conforme, chargement effectif,
résolution prouvée. Deux points restaient hors de portée d'une session cloud,
parce qu'ils vivent dans des réglages **non versionnés** ou sur **claude.ai** :

- **A.** Le plugin `productivite-labo-codex` ne se charge pas côté Claude Code.
- **B.** Une copie divergente du skill `design-interface` subsiste dans les
  skills du compte claude.ai.

---

## 2. Déjà fait — ne pas refaire

Ces points sont **mesurés**, pas supposés. Ne pas les réauditer :

- Les 92 pointeurs vers l'ancien dossier `Skills pour Claude Code/` sont
  corrigés et poussés (commit `db6d1d96`).
- Le contenu propre à la copie compte de `design-interface` (§9 portes terrain,
  HISTORIQUE, « Ne pas y puiser ») est **déjà rapatrié** dans le fichier du
  dépôt (commit `76c74fb8`). Il n'y a plus rien à récupérer de cette copie.
- `claude plugin validate ./plugins/productivite-labo-codex` → **passed**.
- `claude plugin validate .` (marketplace) → **passed**.
  ⮕ Les manifestes ne sont pas en cause. Inutile de les déboguer.

---

## 3. Tâche A — faire charger le plugin

### Diagnostic établi

`.claude/settings.json` du dépôt déclare bien :

```json
"enabledPlugins": { "productivite-labo-codex@labo-codex": true }
```

Mais `enabledPlugins` dit seulement **d'activer** `labo-codex` ; il ne dit pas
**où la trouver**. C'est `extraKnownMarketplaces` qui le dit, et cette clé vit
dans les réglages **utilisateur** (`~/.claude/settings.json`), qui ne sont pas
versionnés. Sur toute machine ou tout conteneur neuf, la marketplace est donc
inconnue et le plugin ne charge jamais — silencieusement.

### Ce qu'il faut faire

Depuis la racine du dépôt, sur le Mac :

```bash
claude plugin marketplace list      # attendu au départ : "No marketplaces configured"
claude plugin marketplace add ./
claude plugin install productivite-labo-codex@labo-codex
```

⚠ **Piège éprouvé** : `claude plugin marketplace add .` (le point seul) échoue
avec « Invalid marketplace source format ». Il faut **`./`** ou un chemin
absolu.

⚠ Lancer ces commandes **depuis la racine du dépôt sur le Mac** : l'install
écrit un chemin **absolu** dans les réglages. Le chemin du conteneur cloud
(`/home/user/Monitorage_v6`) n'a aucun sens sur le Mac.

### Vérification — ce qui compte comme preuve

Ne pas se contenter d'un « installé avec succès ». Exiger l'inventaire :

```bash
claude plugin list
claude plugin details productivite-labo-codex
```

Attendu, tel que mesuré en conteneur après le remède :

- version **3.1.0**, statut **enabled** ;
- **5 composants** : `gestion-projet`, `memory-management`, `task-management`
  (skills) + `start`, `update` (commandes) ;
- coût always-on ~**798 tokens** par session.

Puis, dans une session neuve : `/start` doit exister, et les trois skills
doivent apparaître dans la liste des skills disponibles. **Si `/start` n'existe
pas, le plugin n'est pas chargé**, quoi qu'en dise `claude plugin list`.

---

## 4. Tâche B — la copie compte de `design-interface`

### Ce que Claude Code NE PEUT PAS faire

Le CLI `claude` **n'a pas de sous-commande `skill`** (vérifié : les commandes
sont `agents`, `auth`, `auto-mode`, `doctor`, `gateway`, `import`, `install`,
`mcp`, `plugin`, `project`, `setup-token`, `ultrareview`, `update`). Les skills
du compte claude.ai ne se gèrent donc pas en ligne de commande, ni ici ni sur le
Mac. Supprimer `~/.claude/skills/synced/design-interface/` en local ne sert à
rien : ce dossier est un **cache de synchronisation**, il se reconstitue.

### Ce que Grégoire doit faire lui-même, sur claude.ai

Supprimer le skill personnalisé **`design-interface`** dans les réglages des
skills de son compte (source `custom`, identifiant
`skill_01JMd6qhpDLhvcn7v7pnWtG2`, dernière modification 2026-08-17 18:05).

Rien n'est perdu : son contenu propre est déjà dans le dépôt (voir §2).

> Décision de Grégoire, 18 août : **c'est le fichier versionné du dépôt qui fait
> foi.** Elle est inscrite dans l'HISTORIQUE du skill.

À ne PAS toucher : `release-et-changelog`, également synchronisé, mais
**identique octet pour octet** au fichier du dépôt. Aucune divergence, aucune
action.

### Vérification par la session, après suppression

```bash
ls ~/.claude/skills/synced/ | grep design-interface   # attendu : plus rien
```

Puis, dans une session neuve, charger le skill `design-interface` et vérifier
que le **répertoire de base annoncé** est bien
`<dépôt>/.claude/skills/design-interface` — et que le corps contient bien
« §9. Livrer du changement visuel non éprouvable ».

---

## 5. Question ouverte — à trancher, pas à supposer

**Peut-on versionner l'enregistrement de la marketplace**, pour que la tâche A
n'ait plus jamais à être refaite (ni sur une autre machine, ni dans une session
cloud) ?

L'hypothèse : déclarer `extraKnownMarketplaces` dans le `.claude/settings.json`
**du dépôt** avec un chemin **relatif** :

```json
"extraKnownMarketplaces": {
  "labo-codex": { "source": { "source": "directory", "path": "." } }
}
```

La session cloud n'a **pas pu tester** cette piste : l'écriture dans
`.claude/settings.json` y est bloquée par le classifieur de sécurité. Elle n'a
donc **aucune preuve** que le chemin relatif résout — c'est une hypothèse, pas
une recommandation.

**À faire** : tester pour de vrai. Repartir d'un état propre
(`claude plugin marketplace remove labo-codex`), écrire la clé dans le
`settings.json` du dépôt, puis vérifier avec `claude plugin marketplace list` et
`claude plugin details`.

- Si le chemin relatif résout → **committer**, et la tâche A devient inutile
  pour toutes les sessions futures. Le noter dans `SESSION.md`.
- S'il ne résout pas → **ne rien committer**, et documenter en une ligne dans
  cette consigne que l'enregistrement reste une étape manuelle par machine.

> **TRANCHÉ (18 août 2026, terminal du Mac) : le chemin relatif ne résout PAS.**
> Testé pour de vrai depuis un état propre : `extraKnownMarketplaces` avec
> `{"source": "directory", "path": "."}` dans le `.claude/settings.json` du
> dépôt → la marketplace n'apparaît pas dans `claude plugin marketplace list`
> et une session headless lancée de la racine ne charge aucun des 5 composants.
> **L'enregistrement de la marketplace reste une étape manuelle par machine**
> (`claude plugin marketplace add ./` puis
> `claude plugin install productivite-labo-codex@labo-codex`, depuis la racine).
> Piège observé en passant : `claude plugin marketplace remove labo-codex`
> **vide aussi `enabledPlugins` dans le `.claude/settings.json` du projet**
> (fichier versionné). Après le test, la réinstallation a restitué l'état de
> HEAD à l'octet près — rien à committer côté settings. Si un jour la
> marketplace est retirée sans être réinstallée, penser à
> `git restore .claude/settings.json`.

---

## 6. Ce qu'il ne faut pas faire

- **Ne pas** modifier les 15 skills de `.claude/skills/` : ils sont vérifiés et
  fonctionnels.
- **Ne pas** rouvrir la chasse aux pointeurs `Skills pour Claude Code/` dans
  `Rapports/`, `plans de travail/_archives/` et `audit/` : ce sont des traces
  datées, laissées telles quelles **volontairement**.
- **Ne pas** committer `~/.claude/settings.json` ni quoi que ce soit hors dépôt.
- **Ne pas** conclure « ça marche » sur la foi d'un message de succès du CLI.
  La preuve, c'est l'inventaire des composants et l'existence de `/start` dans
  une session neuve.

---

## 7. En terminant

Règle de relais du projet : fusionner vers `main` en fin de session. Si un seul
fichier change (cette consigne, ou `.claude/settings.json` si le §5 aboutit),
c'est un `patch` documentaire — **aucun bump de version**, aucun code applicatif
touché.

Référence de la suite de tests au moment de la rédaction : **Vitest 2701/2701**
(268 fichiers).
