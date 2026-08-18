# Consigne — Plugin, copie compte de `design-interface`, et déclenchement des skills neufs

> Document de travail destiné à une session **Claude Code lancée depuis le
> terminal du Mac de Grégoire**. Préparé le 18 août 2026 par une session cloud
> qui a pu *diagnostiquer* ces trois points mais pas les *appliquer* : ils
> touchent des réglages hors dépôt, ou exigent une session non contaminée.
> Supprimable après usage — ne fait pas partie du code applicatif.
>
> ⚠ **Tâche C : ne pas la faire exécuter par la session qui lit ce document.**
> Elle y aurait lu les réponses attendues. Voir le protocole au §5.

---

## 1. Pourquoi cette consigne existe

Un audit des skills (17-18 août) a confirmé que les **15 skills de
`.claude/skills/` fonctionnent** : frontmatter conforme, chargement effectif,
résolution prouvée. Deux points restaient hors de portée d'une session cloud,
parce qu'ils vivent dans des réglages **non versionnés** ou sur **claude.ai** :

- **A.** Le plugin `productivite-labo-codex` ne se charge pas côté Claude Code.
- **B.** Une copie divergente du skill `design-interface` subsiste dans les
  skills du compte claude.ai.
- **C.** `design-interface` et `release-et-changelog` — les deux skills **créés**
  le 17 août — n'ont jamais été testés au **déclenchement**. Les 4 tests de
  `FICHE-RELECTURE.md` ne portaient que sur les 13 skills migrés. Une session
  cloud ne peut pas s'auto-tester là-dessus de façon crédible : elle connaît la
  réponse attendue.

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

### ⚠⚠ Le piège : `marketplace remove` touche un fichier VERSIONNÉ

**`claude plugin marketplace remove labo-codex` vide `enabledPlugins` dans le
`.claude/settings.json` du PROJET** — pas dans les réglages utilisateur, dans le
fichier suivi par git. Observé le 18 août 2026 sur le Mac.

C'est le pire genre d'effet de bord : silencieux, dans un fichier de config que
personne ne relit, et qui part au prochain `git add -A` sans que le message de
commit le mentionne. Il désactiverait le plugin **pour toutes les machines et
toutes les sessions cloud**, en se faisant passer pour un commit documentaire.

**Reproduit en conteneur le 18 août** (contre-épreuve, pas reprise sur parole).
La clé n'est pas seulement vidée en `"enabledPlugins": {}` — elle est aussi
**déplacée en fin de fichier**. Le diff ressemble donc à un réordonnancement
anodin de JSON, ce qui le rend d'autant plus facile à laisser passer en
relecture rapide :

```diff
-  "enabledPlugins": {
-    "productivite-labo-codex@labo-codex": true
-  },
   "hooks": { … }
+  "enabledPlugins": {}
```

Réinstaller la marketplace **restitue** le fichier à l'octet près (vérifié) —
donc un cycle `remove` → `add` → `install` complet ne laisse pas de trace. C'est
un `remove` **laissé en plan** qui est dangereux.

**Règle** : après TOUTE commande `claude plugin ...` lancée depuis le dépôt —
`remove`, `add`, `install`, `uninstall` — vérifier immédiatement :

```bash
git status --short .claude/settings.json    # attendu : rien
git diff .claude/settings.json              # attendu : vide
```

Si le fichier a bougé et que ce n'était pas voulu :

```bash
git restore .claude/settings.json
```

⮕ Ne jamais committer une modification de `.claude/settings.json` qui n'a pas
été **décidée**. Une modification qui apparaît comme *conséquence* d'une
commande plugin est un dégât, pas un changement.

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

## 5. Tâche C — les deux déclenchements jamais éprouvés

### Pourquoi cette tâche existe

Les 4 tests de déclenchement de `FICHE-RELECTURE.md` (17 août) portaient sur les
**13 skills migrés**. Les deux skills **créés** ce jour-là — `design-interface` et
`release-et-changelog` — n'ont jamais été testés au déclenchement. On sait qu'ils
se chargent et se résolvent ; on ne sait pas qu'ils **partent seuls**.

C'est la dernière pièce manquante avant de déclarer le chantier skills clos.

### ⚠ Protocole — sinon le test ne vaut rien

**La session qui subit le test ne doit PAS avoir lu cette consigne.** Elle y
lirait la réponse attendue et le résultat serait sans valeur. C'est la règle qui
avait été tenue le 17 août (« deux sessions neuves distinctes, non contaminées »).

Concrètement :

1. ⚠⚠ **`cd` DANS LE DÉPÔT AVANT de lancer `claude`**, puis vérifier que
   l'en-tête de Claude Code affiche bien le chemin du dépôt sous le logo —
   `…/Monitorage_v6`, **pas `/Users/kuekatsheu`**.
2. Ouvrir la session **neuve** dans un autre terminal. Ne rien lui donner d'autre.
3. Y taper **une seule** des phrases ci-dessous, telle quelle.
4. Observer si le skill attendu se charge **sans qu'on le nomme**.
5. Fermer la session. **Une session neuve par cas** — la première est contaminée
   dès qu'elle a vu le résultat.

Ne jamais faire passer ces tests par la session qui exécute cette consigne.

#### ⚠⚠ Les deux façons de rater ce test sans s'en apercevoir

**A. Lancer depuis le mauvais dossier.** Les skills du projet vivent dans
`<dépôt>/.claude/skills/` et ne sont chargés **que si le dépôt est le dossier de
travail**. Lancée depuis `/Users/kuekatsheu`, une session n'a **aucun** skill du
projet — le test rend « rien ne se charge » quelles que soient les descriptions.
C'est arrivé au premier repassage du 18 août : les deux cas ont été déclarés en
échec, et **le défaut était dans le protocole, pas dans les skills**.

**B. Confondre une LECTURE avec un DÉCLENCHEMENT.** Un skill qui se déclenche
apparaît comme une invocation de skill. Si tu vois à la place une commande
`cat …/SKILL.md`, ou un `cd` en chemin absolu vers le dépôt, **le skill ne s'est
pas déclenché** : la session est allée lire le fichier comme un document
ordinaire. C'est un résultat NÉGATIF, même si le bon nom de skill apparaît à
l'écran.

⮕ **Repère simple** : un `cd` en chemin **absolu** vers le dépôt prouve à lui
seul que la session n'était pas dedans. Si elle y était, elle n'aurait rien eu
à `cd`.

### Cas 1 — `design-interface`

> Phrase à taper : **« le tableau de bord est laid, ça déborde à droite »**

Attendu : `design-interface` se charge seul.

Ce cas est choisi exprès. La description du skill **dans le dépôt** est formelle
et technique (`styles.css`, contraste, responsive, microcopy). La copie qui vivait
sur le compte claude.ai, elle, listait tes tournures réelles — « c'est laid »,
« ça déborde », « on ne voit pas », « ça ne rentre pas sur iPad ». On a tranché en
faveur du dépôt (tâche B) : **il faut donc vérifier que la version retenue part
quand même sur ta façon de parler.**

⮕ **Si le skill ne part pas**, le correctif est connu et local : ajouter ces
tournures aux déclencheurs de la `description` dans
`.claude/skills/design-interface/SKILL.md`. Ce n'est pas le principe qui est en
cause, c'est un frontmatter à enrichir.

### Cas 2 — `release-et-changelog`

> Phrase à taper : **« je veux publier ce qu'on a fait cette semaine aux
> testeurs »**

Attendu : `release-et-changelog` se charge seul.

Ce cas évite volontairement les mots que la `description` contient déjà
(« on livre », « bump », « release », « changelog », « nouvelles », « version ») :
un test qui recopie la description ne prouve rien d'autre qu'une correspondance
littérale. On teste l'intention, pas le mot-clé.

⮕ **Si le skill ne part pas**, même correctif : enrichir les déclencheurs de sa
`description`.

### Consigner le résultat

Les deux cas, passés ou non, se notent dans `SESSION.md` avec la phrase employée
et le skill effectivement chargé. Un « ça a marché » sans la phrase n'est pas
reproductible — et c'est reproductible qu'on veut, puisque toute modification
future d'une `description` peut casser le déclenchement.

---

## 6. Question ouverte — à trancher, pas à supposer

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
> C'est ce test qui a mis au jour le piège du `marketplace remove` sur le
> `.claude/settings.json` versionné — **décrit et outillé au §3**, parce qu'il
> mord sur toutes les commandes plugin, pas seulement sur cette
> question-ci. Ici, la réinstallation avait restitué l'état de HEAD à l'octet
> près : rien à committer côté settings.

---

## 7. Ce qu'il ne faut pas faire

- **Ne pas** modifier les 15 skills de `.claude/skills/` : ils sont vérifiés et
  fonctionnels.
- **Ne pas** rouvrir la chasse aux pointeurs `Skills pour Claude Code/` dans
  `Rapports/`, `plans de travail/_archives/` et `audit/` : ce sont des traces
  datées, laissées telles quelles **volontairement**.
- **Ne pas** committer `~/.claude/settings.json` ni quoi que ce soit hors dépôt.
- **Ne pas** committer un `.claude/settings.json` du projet modifié par une
  commande `claude plugin ...` : voir le piège du §3. Vérifier après chaque
  commande, restaurer si besoin.
- **Ne pas** conclure « ça marche » sur la foi d'un message de succès du CLI.
  La preuve, c'est l'inventaire des composants et l'existence de `/start` dans
  une session neuve.

---

## 8. En terminant

Règle de relais du projet : fusionner vers `main` en fin de session. Ce qui peut
changer ici est documentaire — cette consigne, `SESSION.md`, et au plus une
`description` de frontmatter si un cas de la tâche C échoue. **Aucun bump de
version**, aucun code applicatif touché.

⮕ **Le chantier skills n'est clos que quand les deux cas de la tâche C sont
passés**, ou que leurs `description` ont été corrigées et les cas repassés. Tout
le reste est déjà acquis et mesuré (§2).

Référence de la suite de tests au moment de la rédaction : **Vitest 2701/2701**
(268 fichiers).
