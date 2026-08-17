# Patch « skills » — fiche de relecture

**17 août 2026** · à relire avant d'appliquer. Rien n'a été écrit sur ton disque.

---

## Ce que j'ai trouvé en ouvrant les fichiers

**12 des 13 fichiers ont déjà un frontmatter YAML conforme**, avec un `name` en
kebab-case et une `description` riche en déclencheurs. Tu les avais écrits au bon
format, dans le mauvais dossier. Seul `SKILL_RaI.md` en manquait un.

Conséquence : **je n'ai réécrit aucune de tes descriptions.** Le patch est un
déménagement, pas une refonte. La seule rédaction neuve est le frontmatter de
`depistage-rai`, tiré de ta propre ligne « Déclenchement ».

Autre trouvaille : tu avais déjà anticipé la collision entre le skill
`fin-de-session-labo-codex` et la commande `/fin-de-session` en suffixant le nom.
Rien à corriger.

---

## Les quatre fichiers livrés

| Fichier | Rôle |
|---|---|
| `CLAUDE.md` | remplace le tien : **394 → 191 lignes**, 6 440 → **2 641 tokens** |
| `migrer-skills.sh` | déménage les 13 fichiers, dry-run par défaut |
| `skills/design-interface/SKILL.md` | nouveau, 1 998 tokens, extrait de `CLAUDE.md` |
| `skills/release-et-changelog/SKILL.md` | nouveau, 1 549 tokens, extrait de `CLAUDE.md` |

Économie sur `CLAUDE.md` seul : **3 799 tokens par session, et par `/compact`**
(il est réinjecté après chaque compaction). Économie sur les dix références :
~84 300 → ~2 600 au repos.

---

## Ce que le script fait

1. **Déménage** les 13 fichiers en `git mv` (l'historique suit) vers
   `.claude/skills/<nom>/SKILL.md`
2. **Insère** le frontmatter de `depistage-rai`
3. **Répare les références croisées** : tes descriptions et tes corps se citent
   entre eux par `SKILL_X.md`, chemins qui meurent au déménagement. Remplacés par
   `` le skill `x` ``. Concerne aussi `.claude/commands/fin-de-session.md` et les
   4 fichiers du plugin `productivite-labo-codex`.
4. **Verse** `ANALYSE-verification-adverse.md` en fichier de référence lié à
   `verification-adverse`
5. **Retire** `section-design-claude-md.md` (remplacé par `design-interface`) et
   le dossier `Skills pour Claude Code/` devenu vide — ta règle zéro-dette

**Garde-fous** : dry-run par défaut, refus si l'arbre git n'est pas propre,
idempotent, aucun `SESSION.md` / `BACKLOG.md` / `Rapports/` touché.

**Testé** sur un dépôt factice reproduisant ta structure. Deux défauts trouvés et
corrigés au passage : des backticks imbriqués sur les références déjà écrites en
code, et un message de fin incohérent sur le retrait du dossier source.

---

## Quatre décisions qui te reviennent

### 1. `A-C-P` ou `A-C-P-E` ?

`section-design-claude-md.md` (12 mai) dit « indices **A-C-P-E** ». Ton
`CLAUDE.md` (8 août, donc plus récent) dit « indices **A-C-P** ». `js/snapshots.js`
mentionne un « indice E ».

Je n'ai pas tranché : le skill `design-interface` dit « les indices » sans
énumérer. **À corriger par toi**, c'est du contenu métier.

### 2. Garder `debug-labo-codex` ?

Ce fichier existe (16 Ko, frontmatter conforme) mais **n'est référencé nulle part
dans `CLAUDE.md`**. Il est dormant depuis un moment. Le patch le migre quand
même. Si tu ne t'en sers pas, dis-le et je l'archive plutôt que de le migrer.

### 3. Les commentaires dans `js/*.js`

Une poignée de fichiers citent les skills en commentaire :
`js/codex.js` (« Cf. SKILL_Securite_donnees §9.1.2 »), `js/bibliotheque-ui.js`,
`js/wizard-pratique-v2.js`. **Le script n'y touche pas** : ces citations restent
lisibles après renommage et les modifier polluerait le diff d'un chantier qui ne
concerne pas le code applicatif. Dis-moi si tu préfères les aligner.

### 4. La procédure de développement reste dans `CLAUDE.md`

J'avais annoncé qu'elle deviendrait un skill. En la relisant, elle fait 8 lignes
et s'applique à **chaque** chantier : la sortir la rendrait conditionnelle alors
qu'elle ne l'est pas. Je l'ai condensée sur place. Corrige-moi si tu voyais
autrement.

---

## Deux ajouts que je me suis permis dans `CLAUDE.md`

1. **Un garde-fou sur les lectures**, parce que c'est le piège à 106 000 tokens :

   > ⚠ **Lectures ciblées obligatoires.** `SESSION.md` fait ~7 600 lignes et
   > `BACKLOG.md` ~1 300, avec des lignes de plusieurs milliers de caractères.
   > **Ne jamais les lire sans `offset`/`limit`.**

   Cette consigne vivait dans `SKILL_Debut_de_session.md` §8, donc dans un fichier
   qui n'est lu que si la session pense à le lire. Elle remonte au niveau toujours
   chargé, en trois lignes.

2. **Une phrase sur le taux de déclenchement** : si un skill ne se charge pas
   alors qu'il devrait, c'est le signal que sa `description` est à corriger. Ça
   rend le dispositif auto-correctif au lieu de silencieux.

J'ai aussi **accentué tout le fichier** (l'ancien mélangeait les deux). Ça gonfle
le diff, mais sur un fichier réécrit de toute façon.

---

## Pour appliquer

```bash
cd ~/Documents/GitHub/Monitorage_v6
git checkout -b chantier/skills-claude-code

# 1. déposer les fichiers livrés
#    - CLAUDE.md                      → racine (remplace l'existant)
#    - migrer-skills.sh               → racine (temporaire)
#    - design-interface/SKILL.md      → .claude/skills/design-interface/
#    - release-et-changelog/SKILL.md  → .claude/skills/release-et-changelog/

# 2. lire ce que ça va faire
bash migrer-skills.sh

# 3. appliquer (refuse si l'arbre n'est pas propre)
bash migrer-skills.sh --appliquer

# 4. contrôler
git status --short
git diff --stat
rm migrer-skills.sh
```

---

## La vérification qui compte vraiment

Rien de tout cela ne vaut si les skills ne se déclenchent pas. **Dans une session
Claude Code neuve, à la racine du dépôt :**

1. `/context` → les **15 skills** doivent apparaître sous `Project`
   (13 migrés + `design-interface` + `release-et-changelog`)
2. Dire « je travaille sur `js/pratiques/` » → `pratiques-notation` doit se
   charger **seul**
3. Dire « je touche à `import-export.js` » → `integrite-globaux` et
   `securite-donnees` doivent se charger **seuls**
4. Dire « on commence » → `debut-de-session-labo-codex` doit se déclencher

Si l'un ne se déclenche pas, sa `description` est en cause, pas le principe. Le
correctif est local : enrichir les mots-clés de ce seul frontmatter.

**Tant que ces quatre tests ne sont pas passés, le chantier n'est pas fini.**
C'est la version « break-test » de ton §4 appliquée à ce patch : le dispositif
doit prouver qu'il fonctionne, pas seulement qu'il est installé.
